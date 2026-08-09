"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = handleStripeWebhook;
const http_status_codes_1 = require("http-status-codes");
const stripe_1 = require("../../config/stripe");
const env_1 = require("../../config/env");
const payment_service_1 = require("./payment.service");
async function handleStripeWebhook(req, res) {
    if (!stripe_1.stripe || !env_1.env.STRIPE_WEBHOOK_SECRET) {
        res.status(http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE).json({
            success: false,
            message: "Stripe webhook service is not configured",
        });
        return;
    }
    const signature = req.headers["stripe-signature"];
    if (!signature || Array.isArray(signature)) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Missing Stripe signature",
        });
        return;
    }
    let event;
    try {
        event = stripe_1.stripe.webhooks.constructEvent(req.body, signature, env_1.env.STRIPE_WEBHOOK_SECRET);
    }
    catch {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid Stripe webhook signature",
        });
        return;
    }
    try {
        await payment_service_1.paymentService.handleWebhookEvent(event);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Webhook processed successfully",
        });
    }
    catch (error) {
        console.error("Stripe webhook processing failed:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Webhook processing failed",
        });
    }
}
