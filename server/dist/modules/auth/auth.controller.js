"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const http_status_codes_1 = require("http-status-codes");
const cookies_1 = require("../../config/cookies");
const auth_schema_1 = require("../../schemas/auth.schema");
const app_error_1 = require("../../utils/app-error");
const api_response_1 = require("../../utils/api-response");
const auth_service_1 = require("./auth.service");
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
async function login(req, res) {
    const parsed = auth_schema_1.loginSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new app_error_1.AppError("Invalid login credentials", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const { user, tokens } = await auth_service_1.authService.login(parsed.data);
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, cookies_1.accessCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookies_1.refreshCookieOptions);
    return res.status(http_status_codes_1.StatusCodes.OK).json((0, api_response_1.successResponse)("Login successful", {
        user,
    }));
}
async function refresh(req, res) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
        throw new app_error_1.AppError("Refresh token is required", http_status_codes_1.StatusCodes.UNAUTHORIZED);
    }
    const tokens = await auth_service_1.authService.refreshAccessToken(refreshToken);
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, cookies_1.accessCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookies_1.refreshCookieOptions);
    return res.status(http_status_codes_1.StatusCodes.OK).json((0, api_response_1.successResponse)("Token refreshed successfully"));
}
async function logout(req, res) {
    if (req.user?.userId) {
        await auth_service_1.authService.logout(req.user.userId);
    }
    res.clearCookie(ACCESS_TOKEN_COOKIE, cookies_1.accessCookieOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookies_1.refreshCookieOptions);
    return res.status(http_status_codes_1.StatusCodes.OK).json((0, api_response_1.successResponse)("Logout successful"));
}
