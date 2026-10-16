import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types.js";

const getAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return secret;
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return secret;
};

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, getAccessSecret()) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, getRefreshSecret()) as JwtPayload;
};

