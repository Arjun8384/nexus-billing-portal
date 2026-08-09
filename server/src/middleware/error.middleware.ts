import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { StatusCodes } from "http-status-codes";

import { AppError } from "../utils/app-error";

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(error);

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
}