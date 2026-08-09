"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const invoice_routes_1 = require("./modules/invoices/invoice.routes");
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
const payment_controller_1 = require("./modules/payments/payment.controller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use("/api/payments/webhook", express_1.default.raw({
    type: "application/json",
}), payment_controller_1.paymentController.handleWebhook.bind(payment_controller_1.paymentController));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/invoices", invoice_routes_1.invoiceRoutes);
app.use("/api/payments", payment_routes_1.default);
app.use(error_middleware_1.errorMiddleware);
app.get("/api/health", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Server running successfully",
    });
});
exports.default = app;
