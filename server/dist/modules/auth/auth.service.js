"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = require("http-status-codes");
const jose_1 = require("jose");
const env_1 = require("../../config/env");
const user_repository_1 = require("../../modules/users/user.repository");
const app_error_1 = require("../../utils/app-error");
const jwt_1 = require("../../utils/jwt");
class AuthService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async login(input) {
        const user = await this.userRepo.findByEmail(input.email);
        if (!user) {
            throw new app_error_1.AppError("Invalid email or password", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        if (!user.isActive) {
            throw new app_error_1.AppError("Your account has been deactivated", http_status_codes_1.StatusCodes.FORBIDDEN);
        }
        const passwordMatches = await bcryptjs_1.default.compare(input.password, user.password);
        if (!passwordMatches) {
            throw new app_error_1.AppError("Invalid email or password", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        const userId = user._id.toString();
        const accessTokenPayload = {
            userId,
            role: user.role,
            type: "access",
        };
        const refreshTokenPayload = {
            userId,
            role: user.role,
            type: "refresh",
        };
        const accessToken = await (0, jwt_1.generateToken)(accessTokenPayload);
        const refreshToken = await (0, jwt_1.generateToken)(refreshTokenPayload);
        const refreshTokenHash = await this.hashRefreshToken(refreshToken);
        await this.userRepo.updateRefreshToken(userId, refreshTokenHash);
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
    async refreshAccessToken(refreshToken) {
        let payload;
        try {
            const result = await (0, jose_1.jwtVerify)(refreshToken, new TextEncoder().encode(env_1.env.JWT_SECRET));
            payload = result.payload;
        }
        catch {
            throw new app_error_1.AppError("Invalid or expired refresh token", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        if (payload.type !== "refresh" ||
            typeof payload.userId !== "string") {
            throw new app_error_1.AppError("Invalid refresh token", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        const user = await this.userRepo.findById(payload.userId);
        if (!user || !user.isActive) {
            throw new app_error_1.AppError("User account is unavailable", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        const storedHash = user.refreshToken;
        if (!storedHash) {
            throw new app_error_1.AppError("Refresh session is invalid", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        const tokenMatches = await bcryptjs_1.default.compare(refreshToken, storedHash);
        if (!tokenMatches) {
            throw new app_error_1.AppError("Refresh session is invalid", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        const userId = user._id.toString();
        const newAccessTokenPayload = {
            userId,
            role: user.role,
            type: "access",
        };
        const newRefreshTokenPayload = {
            userId,
            role: user.role,
            type: "refresh",
        };
        const newAccessToken = await (0, jwt_1.generateToken)(newAccessTokenPayload);
        const newRefreshToken = await (0, jwt_1.generateToken)(newRefreshTokenPayload);
        const newRefreshTokenHash = await this.hashRefreshToken(newRefreshToken);
        await this.userRepo.updateRefreshToken(userId, newRefreshTokenHash);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(userId) {
        await this.userRepo.updateRefreshToken(userId, null);
    }
    async hashRefreshToken(refreshToken) {
        return bcryptjs_1.default.hash(refreshToken, 12);
    }
}
exports.authService = new AuthService(user_repository_1.userRepository);
