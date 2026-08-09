"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
function validate(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
            return;
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
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
