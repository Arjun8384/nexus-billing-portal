import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import {
  accessCookieOptions,
  refreshCookieOptions,
} from "@/config/cookies";
import { loginSchema } from "@/schemas/auth.schema";
import { AppError } from "@/utils/app-error";
import { successResponse } from "@/utils/api-response";
import type { AuthenticatedRequest } from "@/middleware/auth.middleware";

import { authService } from "./auth.service";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

export async function login(
  req: Request,
  res: Response
) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      "Invalid login credentials",
      StatusCodes.BAD_REQUEST
    );
  }

  const { user, tokens } =
    await authService.login(parsed.data);

  res.cookie(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    accessCookieOptions
  );

  res.cookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    refreshCookieOptions
  );

  return res.status(StatusCodes.OK).json(
    successResponse("Login successful", {
      user,
    })
  );
}

export async function refresh(
  req: Request,
  res: Response
) {
  const refreshToken =
    req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required",
      StatusCodes.UNAUTHORIZED
    );
  }

  const tokens =
    await authService.refreshAccessToken(
      refreshToken
    );

  res.cookie(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    accessCookieOptions
  );

  res.cookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    refreshCookieOptions
  );

  return res.status(StatusCodes.OK).json(
    successResponse(
      "Token refreshed successfully"
    )
  );
}

export async function logout(
  req: AuthenticatedRequest,
  res: Response
) {
  if (req.user?.userId) {
    await authService.logout(req.user.userId);
  }

  res.clearCookie(
    ACCESS_TOKEN_COOKIE,
    accessCookieOptions
  );

  res.clearCookie(
    REFRESH_TOKEN_COOKIE,
    refreshCookieOptions
  );

  return res.status(StatusCodes.OK).json(
    successResponse("Logout successful")
  );
}