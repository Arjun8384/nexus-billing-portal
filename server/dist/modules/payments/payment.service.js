"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const roles_1 = require("../../constants/roles");
const stripe_1 = require("../../config/stripe");
const app_error_1 = require("../../utils/app-error");
const invoice_repository_1 = require("../../modules/invoices/invoice.repository");
const invoice_pdf_1 = require("../../modules/invoices/invoice.pdf");
const payment_email_1 = require("./payment.email");
class PaymentService {
    invoiceRepo;
    constructor(invoiceRepo) {
        this.invoiceRepo = invoiceRepo;
    }
    async createCheckoutSession(invoiceId, userId, role) {
        if (!stripe_1.stripe) {
            throw new app_error_1.AppError("Stripe payment service is not configured", http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE);
        }
        if (!mongoose_1.Types.ObjectId.isValid(invoiceId)) {
            throw new app_error_1.AppError("Invalid invoice ID", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new app_error_1.AppError("Invalid user ID", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) {
            throw new app_error_1.AppError("Invoice not found", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        if (role === roles_1.ROLES.CLIENT) {
            if (invoice.clientId.toString() !==
                userId) {
                throw new app_error_1.AppError("You are not authorized to pay this invoice", http_status_codes_1.StatusCodes.FORBIDDEN);
            }
        }
        if (invoice.status !== "ISSUED") {
            throw new app_error_1.AppError("Only issued invoices can be paid", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        if (invoice.paymentStatus !== "UNPAID") {
            throw new app_error_1.AppError("Invoice has already been paid", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const session = await stripe_1.stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: invoice.items.map((item) => ({
                price_data: {
                    currency: invoice.currency.toLowerCase(),
                    product_data: {
                        name: item.description,
                    },
                    unit_amount: Math.round(item.unitPrice * 100),
                },
                quantity: item.quantity,
            })),
            metadata: {
                invoiceId: invoice._id.toString(),
            },
            success_url: `${process.env.CLIENT_URL}/client/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/client/payment/cancelled`,
        });
        if (!session.url) {
            throw new app_error_1.AppError("Unable to create Stripe checkout URL", http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        }
        return {
            sessionId: session.id,
            checkoutUrl: session.url,
        };
    }
    async handleWebhookEvent(event) {
        if (event.type !==
            "checkout.session.completed") {
            return;
        }
        const session = event.data.object;
        const invoiceId = session.metadata?.invoiceId;
        if (!invoiceId) {
            throw new app_error_1.AppError("Invoice ID missing from Stripe session", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) {
            throw new app_error_1.AppError("Invoice not found", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        if (invoice.paymentStatus === "PAID") {
            return;
        }
        const paidAt = new Date();
        const updated = await this.invoiceRepo.updateStatus(invoiceId, "PAID", "PAID", paidAt);
        if (!updated) {
            throw new app_error_1.AppError("Unable to update invoice payment status", http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        }
        const customerEmail = session.customer_details?.email;
        if (!customerEmail) {
            throw new app_error_1.AppError("Customer email not found in Stripe checkout session", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const invoiceResponse = {
            id: updated._id.toString(),
            invoiceNumber: updated.invoiceNumber,
            clientId: updated.clientId.toString(),
            issueDate: updated.issueDate,
            dueDate: updated.dueDate,
            items: updated.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
            })),
            subtotal: updated.subtotal,
            taxRate: updated.taxRate,
            taxAmount: updated.taxAmount,
            total: updated.total,
            currency: updated.currency,
            status: updated.status,
            paymentStatus: updated.paymentStatus,
            paidAt: updated.paidAt,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
        const invoicePdf = (0, invoice_pdf_1.generateInvoicePdf)(invoiceResponse);
        const pdfBuffer = await (0, payment_email_1.pdfToBuffer)(invoicePdf);
        await (0, payment_email_1.sendPaymentReceipt)(invoiceResponse, pdfBuffer, customerEmail);
    }
}
exports.paymentService = new PaymentService(invoice_repository_1.invoiceRepository);
