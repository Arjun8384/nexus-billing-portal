import type {
  RequestHandler,
} from "express";

import { StatusCodes } from "http-status-codes";
import { ZodError, ZodType } from "zod";

export function validate(
  schema: ZodType
): RequestHandler {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);

      next();

      return;
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: error.issues,
        });

        return;
      }

      next(error);
    }
  };
}