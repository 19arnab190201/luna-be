import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error-handler.middleware";
import { User } from "../models/User.model";

interface JwtPayload {
  id: string;
  userType: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token from header
    const authHeader = req.headers.authorization;
    // console.log("authHeader", authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Please log in to access this resource", 401);
    }

    const token = authHeader.split(" ")[1];

    // console.log("token", token);

    // 2) Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-jwt-secret"
    ) as JwtPayload;

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    // 4) Check if user is active
    if (!user.isActive) {
      throw new AppError("User account is deactivated", 401);
    }

    // 5) Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid token. Please log in again", 401));
    } else {
      next(error);
    }
  }
};
