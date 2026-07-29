import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import otpGenerator from "otp-generator";

const DEFAULT_SALT_ROUNDS = 10;

const getSaltRounds = (): number => {
  const value = Number(process.env.SALT_ROUNDS);

  if (!Number.isInteger(value) || value < 4 || value > 15) {
    return DEFAULT_SALT_ROUNDS;
  }

  return value;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, getSaltRounds());
};

export const validatePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateJWT = (
  payload: object,
  secret: string,
  expiresIn: SignOptions["expiresIn"] = "1d",
): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyJWT = <T extends JwtPayload>(
  token: string,
  secret: string,
): T | null => {
  try {
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
};

export const generateOtp = (): string => {
  return otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

export const hashOtp = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, getSaltRounds());
};

export const validateOtp = async (
  otp: string,
  hashedOtp: string,
): Promise<boolean> => {
  return bcrypt.compare(otp, hashedOtp);
};

export const getOtpExpiry = (minutes = 5): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
