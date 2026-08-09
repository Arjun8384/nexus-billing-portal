"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const http_status_codes_1 = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
const jwt_1 = require("../utils/jwt");
async function authenticate(req, _res, next) {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            throw new app_error_1.AppError("Authentication required", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        const payload = await (0, jwt_1.verifyToken)(token);
        if (typeof payload.userId !== "string" ||
            !payload.role ||
            !payload.type) {
            throw new app_error_1.AppError("Invalid authentication token", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        if (payload.type !== "access") {
            throw new app_error_1.AppError("Invalid access token", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        req.user = payload;
        next();
    }
    catch (error) {
        next(error);
    }
}
