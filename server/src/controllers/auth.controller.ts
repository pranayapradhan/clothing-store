import type { Request, Response } from "express";
import {
  loginUser,
  refreshAccessToken,
  registerUser,
} from "../services/auth.service.js";
import {
  clearAuthCookies,
  setAuthCookies,
} from "../utils/cookies.js";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser(
      name,
      email,
      password
    );

    setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Registration failed";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(
      email,
      password
    );

    setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    res.status(401).json({
      success: false,
      message,
    });
  }
};

export const logout = async (
  _req: Request,
  res: Response
) => {
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const getCurrentUser = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};

export const refresh = async (
  req: Request,
  res: Response
) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });

      return;
    }

    const result = await refreshAccessToken(refreshToken);

    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: {
        user: result.user,
      },
    });
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};