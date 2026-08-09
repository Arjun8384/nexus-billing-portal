"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const http_status_codes_1 = require("http-status-codes");
const env_1 = require("../../config/env");
const stripe_1 = require("../../config/stripe");
const payment_service_1 = require("./payment.service");
class PaymentController {
    async createCheckoutSession(req, res) {
        if (!req.user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        const input = req.body;
        if (!input.invoiceId ||
            typeof input.invoiceId !==
                "string") {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invoice ID is required",
            });
            return;
        }
        const session = await payment_service_1.paymentService.createCheckoutSession(input.invoiceId, req.user.userId, req.user.role);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Checkout session created successfully",
            data: session,
        });
    }
    async handleWebhook(req, res) {
        if (!stripe_1.stripe) {
            res.status(http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE).json({
                success: false,
                message: "Stripe payment service is not configured",
            });
            return;
        }
        if (!env_1.env.STRIPE_WEBHOOK_SECRET) {
            res.status(http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE).json({
                success: false,
                message: "Stripe webhook secret is not configured",
            });
            return;
        }
        if (!req.rawBody) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Raw request body is required",
            });
            return;
        }
        const signature = req.headers["stripe-signature"];
        if (!signature) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Stripe signature is missing",
            });
            return;
        }
        let event;
        try {
            event =
                stripe_1.stripe.webhooks.constructEvent(req.rawBody, signature, env_1.env.STRIPE_WEBHOOK_SECRET);
        }
        catch {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid Stripe webhook signature",
            });
            return;
        }
        await payment_service_1.paymentService.handleWebhookEvent(event);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Stripe webhook processed successfully",
        });
    }
}
exports.paymentController = new PaymentController();
