import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/User.model";
import { OTPSession } from "../models/OTPSession.model";
import { AppError } from "../middleware/error-handler.middleware";
import { generateOTP, verifyOTP } from "../services/otp.service";

// Helper function to generate SEHAT ID
const generateSehatId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sehatId = "";
  for (let i = 0; i < 8; i++) {
    sehatId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sehatId;
};

class AuthController {
  // Register new user
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber, userType, name, dateOfBirth, gender } = req.body;

      if (!name) {
        throw new AppError("Name is required", 400);
      }

      // Check if user already exists
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        throw new AppError("User already exists with this phone number", 400);
      }

      // Generate unique SEHAT ID
      let sehatId;
      let isUnique = false;
      while (!isUnique) {
        sehatId = generateSehatId();
        const existingSehatId = await User.findOne({ sehatId });
        if (!existingSehatId) {
          isUnique = true;
        }
      }

      // Create new user
      const user = await User.create({
        phoneNumber,
        userType,
        name,
        sehatId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
      });

      // Generate and send OTP
      const otp = await generateOTP(phoneNumber);

      res.status(201).json({
        status: "success",
        message:
          "User registered successfully. Please verify your phone number.",
        data: {
          userId: user._id,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
          name: user.name,
          sehatId: user.sehatId,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Login user
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber } = req.body;

      // Find user
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        throw new AppError("No user found with this phone number", 404);
      }

      // Generate and send OTP
      const otp = await generateOTP(phoneNumber);

      res.status(200).json({
        status: "success",
        message: "OTP sent successfully",
        data: {
          userId: user._id,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify OTP
  verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber, otp } = req.body;

      // Verify OTP
      const isValid = await verifyOTP(phoneNumber, otp);
      if (!isValid) {
        throw new AppError("Invalid OTP", 400);
      }

      // Find user
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Update user verification status
      user.isPhoneVerified = true;
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const jwtOptions: SignOptions = {
        expiresIn: 604800, // 7 days in seconds
      };
      const refreshOptions: SignOptions = {
        expiresIn: 2592000, // 30 days in seconds
      };

      const accessToken = jwt.sign(
        { id: user._id, userType: user.userType },
        process.env.JWT_SECRET || "your-jwt-secret",
        jwtOptions
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
        refreshOptions
      );

      res.status(200).json({
        status: "success",
        message: "Phone number verified successfully",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            phoneNumber: user.phoneNumber,
            userType: user.userType,
            isPhoneVerified: user.isPhoneVerified,
            name: user.name,
            sehatId: user.sehatId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Refresh token
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret"
      ) as { id: string };

      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Generate new access token
      const jwtOptions: SignOptions = {
        expiresIn: 604800, // 7 days in seconds
      };
      const accessToken = jwt.sign(
        { id: user._id, userType: user.userType },
        process.env.JWT_SECRET || "your-jwt-secret",
        jwtOptions
      );

      res.status(200).json({
        status: "success",
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
