import type {
  NextFunction,
  Response,
} from "express";
import { StatusCodes } from "http-status-codes";

import type { UserRole } from "@/constants/roles";
import type { AuthenticatedRequest } from "./auth.middleware";
import { AppError } from "@/utils/app-error";

export function authorize(
  ...allowedRoles: UserRole[]
) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return next(
        new AppError(
          "Authentication required",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    if (
      !allowedRoles.includes(req.user.role)
    ) {
      return next(
        new AppError(
          "You do not have permission to access this resource",
          StatusCodes.FORBIDDEN
        )
      );
    }

    next();
  };
}