import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError } from "./error-handler.middleware";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
  next();
};
