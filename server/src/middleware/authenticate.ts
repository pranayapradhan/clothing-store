import type { Request, Response, NextFunction } from "express";

import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const payload = verifyAccessToken(token);

    const user = await User.findByPk(payload.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};