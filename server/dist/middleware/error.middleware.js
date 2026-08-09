"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const http_status_codes_1 = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
function errorMiddleware(error, _req, res, _next) {
    if (error instanceof app_error_1.AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    console.error(error);
    return res
        .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : error.message,
    });
}
