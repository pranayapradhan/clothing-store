import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import type { AuthUser } from "../types/auth.types.js";

const SALT_ROUNDS = 12;

const sanitizeUser = (user: User): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "USER",
    isActive: true,
  });

  const authUser = sanitizeUser(user);

  const payload = {
    userId: authUser.id,
    role: authUser.role,
  };

  return {
    user: authUser,
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const authUser = sanitizeUser(user);

  const payload = {
    userId: authUser.id,
    role: authUser.role,
  };

  return {
    user: authUser,
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const refreshAccessToken = async (
  refreshToken: string
) => {
  const payload = verifyRefreshToken(refreshToken);

  const user = await User.findByPk(payload.userId);

  if (!user || !user.isActive) {
    throw new Error("Authentication required");
  }

  const authUser = sanitizeUser(user);

  const newAccessToken = generateAccessToken({
    userId: authUser.id,
    role: authUser.role,
  });

  return {
    user: authUser,
    accessToken: newAccessToken,
  };
};