import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { jwtVerify } from "jose";

import { env } from "@/config/env";
import type { UserRole } from "@/constants/roles";
import { UserRepository, userRepository } from "@/modules/users/user.repository";
import type { LoginInput } from "@/schemas/auth.schema";
import type { JwtPayload } from "@/types/auth";
import { AppError } from "@/utils/app-error";
import { generateToken } from "@/utils/jwt";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async login(input: LoginInput): Promise<{
    user: AuthUser;
    tokens: AuthTokens;
  }> {
    const user = await this.userRepo.findByEmail(input.email);

    if (!user) {
      throw new AppError(
        "Invalid email or password",
        StatusCodes.UNAUTHORIZED
      );
    }

    if (!user.isActive) {
      throw new AppError(
        "Your account has been deactivated",
        StatusCodes.FORBIDDEN
      );
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.password
    );

    if (!passwordMatches) {
      throw new AppError(
        "Invalid email or password",
        StatusCodes.UNAUTHORIZED
      );
    }

    const userId = user._id.toString();

    const accessTokenPayload: JwtPayload = {
      userId,
      role: user.role,
      type: "access",
    };

    const refreshTokenPayload: JwtPayload = {
      userId,
      role: user.role,
      type: "refresh",
    };

    const accessToken = await generateToken(
      accessTokenPayload
    );

    const refreshToken = await generateToken(
      refreshTokenPayload
    );

    const refreshTokenHash =
      await this.hashRefreshToken(refreshToken);

    await this.userRepo.updateRefreshToken(
      userId,
      refreshTokenHash
    );

    await this.userRepo.updateLastLogin(userId);

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<AuthTokens> {
    let payload;

    try {
      const result = await jwtVerify(
        refreshToken,
        new TextEncoder().encode(env.JWT_SECRET)
      );

      payload = result.payload;
    } catch {
      throw new AppError(
        "Invalid or expired refresh token",
        StatusCodes.UNAUTHORIZED
      );
    }

    if (
      payload.type !== "refresh" ||
      typeof payload.userId !== "string"
    ) {
      throw new AppError(
        "Invalid refresh token",
        StatusCodes.UNAUTHORIZED
      );
    }

    const user = await this.userRepo.findById(
      payload.userId
    );

    if (!user || !user.isActive) {
      throw new AppError(
        "User account is unavailable",
        StatusCodes.UNAUTHORIZED
      );
    }

    const storedHash = user.refreshToken;

    if (!storedHash) {
      throw new AppError(
        "Refresh session is invalid",
        StatusCodes.UNAUTHORIZED
      );
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      storedHash
    );

    if (!tokenMatches) {
      throw new AppError(
        "Refresh session is invalid",
        StatusCodes.UNAUTHORIZED
      );
    }

    const userId = user._id.toString();

    const newAccessTokenPayload: JwtPayload = {
      userId,
      role: user.role,
      type: "access",
    };

    const newRefreshTokenPayload: JwtPayload = {
      userId,
      role: user.role,
      type: "refresh",
    };

    const newAccessToken = await generateToken(
      newAccessTokenPayload
    );

    const newRefreshToken = await generateToken(
      newRefreshTokenPayload
    );

    const newRefreshTokenHash =
      await this.hashRefreshToken(newRefreshToken);

    await this.userRepo.updateRefreshToken(
      userId,
      newRefreshTokenHash
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(
      userId,
      null
    );
  }

  private async hashRefreshToken(
    refreshToken: string
  ): Promise<string> {
    return bcrypt.hash(refreshToken, 12);
  }
}

export const authService = new AuthService(
  userRepository
);