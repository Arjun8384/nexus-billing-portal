"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const http_status_codes_1 = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
function authorize(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new app_error_1.AppError("Authentication required", http_status_codes_1.StatusCodes.UNAUTHORIZED));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new app_error_1.AppError("You do not have permission to access this resource", http_status_codes_1.StatusCodes.FORBIDDEN));
        }
        next();
    };
}
