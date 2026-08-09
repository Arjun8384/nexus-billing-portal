"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceController = void 0;
const http_status_codes_1 = require("http-status-codes");
const invoice_service_1 = require("./invoice.service");
const invoice_pdf_1 = require("./invoice.pdf");
class InvoiceController {
    async createInvoice(req, res) {
        const input = req.body;
        const invoice = await invoice_service_1.invoiceService.createInvoice(input);
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            success: true,
            message: "Invoice created successfully",
            data: invoice,
        });
    }
    async getInvoices(req, res) {
        if (!req.user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        const invoices = await invoice_service_1.invoiceService.getInvoices(req.user.userId, req.user.role);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Invoices retrieved successfully",
            data: invoices,
        });
    }
    async getInvoiceById(req, res) {
        if (!req.user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        const { invoiceId } = req.params;
        if (typeof invoiceId !== "string") {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid invoice ID",
            });
            return;
        }
        const invoice = await invoice_service_1.invoiceService.getInvoiceById(invoiceId, req.user.userId, req.user.role);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Invoice retrieved successfully",
            data: invoice,
        });
    }
    async updateInvoice(req, res) {
        if (!req.user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        const { invoiceId } = req.params;
        if (typeof invoiceId !== "string") {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid invoice ID",
            });
            return;
        }
        const input = req.body;
        const invoice = await invoice_service_1.invoiceService.updateInvoice(invoiceId, input);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Invoice updated successfully",
            data: invoice,
        });
    }
    async generatePdf(req, res) {
        if (!req.user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        const invoiceId = req.params.invoiceId;
        if (typeof invoiceId !== "string") {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid invoice ID",
            });
            return;
        }
        const invoice = await invoice_service_1.invoiceService.getInvoiceById(invoiceId, req.user.userId, req.user.role);
        const pdf = (0, invoice_pdf_1.generateInvoicePdf)(invoice);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
        pdf.pipe(res);
    }
    async updateStatus(req, res) {
        if (!req.user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        const invoiceId = req.params.invoiceId;
        if (typeof invoiceId !== "string") {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid invoice ID",
            });
            return;
        }
        const status = req.body.status;
        if (status !== "ISSUED" &&
            status !== "PAID" &&
            status !== "CANCELLED") {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid invoice status",
            });
            return;
        }
        const invoice = await invoice_service_1.invoiceService.updateStatus(invoiceId, status);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Invoice status updated successfully",
            data: invoice,
        });
    }
    async getSummary(req, res) {
        if (!req.user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        const summary = await invoice_service_1.invoiceService.getSummary(req.user.userId, req.user.role);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Invoice summary retrieved successfully",
            data: summary,
        });
    }
}
exports.invoiceController = new InvoiceController();
