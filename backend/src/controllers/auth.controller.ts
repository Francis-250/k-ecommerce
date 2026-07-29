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
import { sendEmail } from "../lib/mailer";

type RegisterBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
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

    const [newUser] = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: await hashPassword(password),
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
          otp_expiry: getOtpExpiry(5),
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

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const token = generateJWT(
      {
        sub: existingUser.id,
        role: existingUser.role,
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

    return res.status(200).json({
      success: true,
      message: "Login successful",
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
