import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../lib/mailer";
import {
  generateOtp,
  getOtpExpiry,
  hashOtp,
  hashPassword,
  validateOtp,
} from "../utils/helpers";

const recoveryResponse = {
  success: true,
  message: "If that account exists, a password reset code has been sent",
};

export const forgotPassword = async (req: Request, res: Response) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!user) {
    return res.status(200).json(recoveryResponse);
  }

  const plainOtp = generateOtp();

  await prisma.$transaction(async (tx) => {
    await tx.otpCodes.deleteMany({
      where: { userId: user.id, otp_type: "RESET" },
    });
    await tx.otpCodes.create({
      data: {
        userId: user.id,
        otp: await hashOtp(plainOtp),
        otp_expiry: getOtpExpiry(15),
        otp_type: "RESET",
      },
    });
  });

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    text: `Your password reset code is: ${plainOtp}. It expires in 15 minutes.`,
  });

  return res.status(200).json(recoveryResponse);
};

export const resetPassword = async (req: Request, res: Response) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: "Email, reset code, and new password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "The reset code is invalid or expired",
    });
  }

  const resetCode = await prisma.otpCodes.findFirst({
    where: {
      userId: user.id,
      otp_type: "RESET",
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (
    !resetCode ||
    resetCode.otp_expiry < new Date() ||
    !(await validateOtp(otp, resetCode.otp))
  ) {
    return res.status(400).json({
      success: false,
      message: "The reset code is invalid or expired",
    });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(password) },
    }),
    prisma.otpCodes.deleteMany({
      where: { userId: user.id, otp_type: "RESET" },
    }),
  ]);

  res.clearCookie("token", { path: "/" });

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};
