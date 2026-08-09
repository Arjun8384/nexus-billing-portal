import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { StatusCodes } from "http-status-codes";

import type { JwtPayload } from "@/types/auth";
import { AppError } from "@/utils/app-error";
import { verifyToken } from "@/utils/jwt";

export interface AuthenticatedRequest
  extends Request {
  user?: JwtPayload;
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new AppError(
        "Authentication required",
        StatusCodes.UNAUTHORIZED
      );
    }

    const payload = await verifyToken(token);

    if (
      typeof payload.userId !== "string" ||
      !payload.role ||
      !payload.type
    ) {
      throw new AppError(
        "Invalid authentication token",
        StatusCodes.UNAUTHORIZED
      );
    }

    if (payload.type !== "access") {
      throw new AppError(
        "Invalid access token",
        StatusCodes.UNAUTHORIZED
      );
    }

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
}