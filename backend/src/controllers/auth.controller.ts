import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  generateJWT,
  generateOtp,
  getOtpExpiry,
  hashOtp,
  hashPassword,
  validateOtp,
  validatePassword,
} from "../utils/helpers";
import { generateOtpEmailHtml, sendEmail } from "../lib/mailer";
import { OAuth2Client } from "google-auth-library";
import { randomBytes } from "node:crypto";

type RegisterBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
};

type LoginBody = {
  email?: string;
  password?: string;
};

type GoogleLoginBody = {
  credential?: string;
};

const googleClient = new OAuth2Client();

function createSession(
  res: Response,
  user: {
    id: string;
    role: "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
  },
): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = generateJWT(
    {
      sub: user.id,
      role: user.role,
    },
    jwtSecret,
    "1d",
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  return token;
}

function formatAuthUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string | null;
  avatar?: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
  isVerified: boolean;
  isActive: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
  };
}

export const getGoogleClientConfig = (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(503).json({
      success: false,
      message: "Google sign-in is not configured",
    });
  }

  return res.json({ success: true, clientId });
};

export const googleLogin = async (
  req: Request<unknown, unknown, GoogleLoginBody>,
  res: Response,
) => {
  try {
    const credential = req.body.credential?.trim();
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "Google sign-in is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email?.trim().toLowerCase();

    if (!payload || !googleId || !email || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google could not verify this email address",
      });
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user?.googleId && user.googleId !== googleId) {
      return res.status(409).json({
        success: false,
        message: "This email is already linked to another Google account",
      });
    }

    const googleIsAuthoritative =
      email.endsWith("@gmail.com") || Boolean(payload.hd);

    if (user && !user.googleId && !googleIsAuthoritative) {
      return res.status(409).json({
        success: false,
        message:
          "Sign in with your password before linking Google to this account",
      });
    }

    if (user && (!user.isActive || user.isBanned)) {
      return res.status(403).json({
        success: false,
        message: "Your account is unavailable",
      });
    }

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          isVerified: true,
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          avatar: user.avatar ?? payload.picture,
          lastLogin: new Date(),
        },
      });
    } else {
      const fallbackName = email.split("@")[0] || "Customer";
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          password: await hashPassword(randomBytes(32).toString("hex")),
          firstName: payload.given_name?.trim() || fallbackName,
          lastName: payload.family_name?.trim() || "Customer",
          avatar: payload.picture,
          isVerified: true,
          emailVerifiedAt: new Date(),
          lastLogin: new Date(),
        },
      });
    }

    const token = createSession(res, user);

    return res.status(200).json({
      success: true,
      message: "Google sign-in successful",
      user: formatAuthUser(user),
      token,
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google sign-in could not be verified",
    });
  }
};

export const register = async (
  req: Request<unknown, unknown, RegisterBody>,
  res: Response,
) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const firstName = req.body.firstName?.trim();
    const lastName = req.body.lastName?.trim();

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, first name, and last name are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const plainOtp = generateOtp();
    const role =
      req.body.role === "ADMIN" || req.body.role === "SUPER_ADMIN"
        ? req.body.role
        : "CUSTOMER";

    const [newUser] = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: await hashPassword(password),
          role,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      await tx.otpCodes.create({
        data: {
          otp: await hashOtp(plainOtp),
          otp_expiry: getOtpExpiry(10),
          otp_type: "REGISTRATION",
          userId: user.id,
        },
      });

      return [user];
    });

    await sendEmail({
      subject: "Your Verification Code",
      to: email,
      text: `Your verification code is: ${plainOtp}`,
      html: generateOtpEmailHtml(plainOtp, "Your Verification Code"),
    });

    return res.status(201).json({
      success: true,
      message: "User created. Check your email for the verification code.",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginBody>,
  res: Response,
) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordIsValid = await validatePassword(
      password,
      existingUser.password,
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!existingUser.isVerified) {
      const plainOtp = generateOtp();

      await prisma.$transaction(async (tx) => {
        await tx.otpCodes.deleteMany({
          where: { userId: existingUser.id, otp_type: "REGISTRATION" },
        });
        await tx.otpCodes.create({
          data: {
            otp: await hashOtp(plainOtp),
            otp_expiry: getOtpExpiry(10),
            otp_type: "REGISTRATION",
            userId: existingUser.id,
          },
        });
      });

      await sendEmail({
        subject: "Your Verification Code",
        to: email,
        text: `Your verification code is: ${plainOtp}`,
        html: generateOtpEmailHtml(plainOtp, "Your Verification Code"),
      });

      return res.status(403).json({
        success: false,
        message: "Verify your email before signing in. A new code has been sent to your email.",
      });
    }

    if (!existingUser.isActive || existingUser.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account is unavailable",
      });
    }

    const token = createSession(res, existingUser);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: formatAuthUser(existingUser),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otpRecord = await prisma.otpCodes.findFirst({
      where: {
        userId: user.id,
        otp_type: "REGISTRATION",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (otpRecord.otp_expiry < new Date()) {
      await prisma.otpCodes.delete({
        where: {
          id: otpRecord.id,
        },
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const isValidOtp = await validateOtp(otp, otpRecord.otp);

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerified: true,
        },
      }),

      prisma.otpCodes.delete({
        where: {
          id: otpRecord.id,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified",
      });
    }

    const plainOtp = generateOtp();

    await prisma.$transaction(async (tx) => {
      await tx.otpCodes.deleteMany({
        where: { userId: user.id, otp_type: "REGISTRATION" },
      });
      await tx.otpCodes.create({
        data: {
          otp: await hashOtp(plainOtp),
          otp_expiry: getOtpExpiry(10),
          otp_type: "REGISTRATION",
          userId: user.id,
        },
      });
    });

    await sendEmail({
      subject: "Your Verification Code",
      to: email,
      text: `Your verification code is: ${plainOtp}`,
      html: generateOtpEmailHtml(plainOtp, "Your Verification Code"),
    });

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

