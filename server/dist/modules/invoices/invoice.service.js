"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const roles_1 = require("../../constants/roles");
const app_error_1 = require("../../utils/app-error");
const invoice_repository_1 = require("./invoice.repository");
class InvoiceService {
    invoiceRepo;
    constructor(invoiceRepo) {
        this.invoiceRepo = invoiceRepo;
    }
    async createInvoice(input) {
        const issueDate = new Date(input.issueDate);
        const dueDate = new Date(input.dueDate);
        if (Number.isNaN(issueDate.getTime()) ||
            Number.isNaN(dueDate.getTime())) {
            throw new app_error_1.AppError("Invalid invoice date", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        this.validateDates(issueDate, dueDate);
        if (!mongoose_1.Types.ObjectId.isValid(input.clientId)) {
            throw new app_error_1.AppError("Invalid client ID", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const totals = this.calculateTotals(input.items, input.taxRate);
        const invoiceNumber = await this.generateInvoiceNumber();
        const invoice = await this.invoiceRepo.create({
            invoiceNumber,
            clientId: new mongoose_1.Types.ObjectId(input.clientId),
            issueDate,
            dueDate,
            items: input.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity *
                    item.unitPrice,
            })),
            subtotal: totals.subtotal,
            taxRate: input.taxRate,
            taxAmount: totals.taxAmount,
            total: totals.total,
            currency: input.currency,
            status: "DRAFT",
            paymentStatus: "UNPAID",
            paidAt: null,
        });
        return this.toInvoiceResponse(invoice);
    }
    async getInvoiceById(invoiceId, userId, role) {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) {
            throw new app_error_1.AppError("Invoice not found", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        if (role === roles_1.ROLES.CLIENT) {
            this.ensureClientOwnership(invoice.clientId, userId);
        }
        return this.toInvoiceWithClientResponse(invoice);
    }
    async getInvoices(userId, role) {
        if (role === roles_1.ROLES.ADMIN) {
            const invoices = await this.invoiceRepo.findAll();
            return invoices.map((invoice) => this.toInvoiceResponse(invoice));
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new app_error_1.AppError("Invalid user ID", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const invoices = await this.invoiceRepo.findByClientId(userId);
        return invoices.map((invoice) => this.toInvoiceResponse(invoice));
    }
    async updateInvoice(invoiceId, input) {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) {
            throw new app_error_1.AppError("Invoice not found", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        if (invoice.status === "PAID") {
            throw new app_error_1.AppError("Paid invoices cannot be modified", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        if (invoice.status === "CANCELLED") {
            throw new app_error_1.AppError("Cancelled invoices cannot be modified", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        let dueDate;
        if (input.dueDate) {
            dueDate = new Date(input.dueDate);
            if (Number.isNaN(dueDate.getTime())) {
                throw new app_error_1.AppError("Invalid due date", http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            this.validateDates(invoice.issueDate, dueDate);
        }
        let update = {};
        if (input.items ||
            input.taxRate !== undefined) {
            const items = input.items ??
                invoice.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                }));
            const taxRate = input.taxRate ??
                invoice.taxRate;
            const totals = this.calculateTotals(items, taxRate);
            update = {
                ...(dueDate && {
                    dueDate,
                }),
                items: items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    amount: item.quantity *
                        item.unitPrice,
                })),
                taxRate,
                subtotal: totals.subtotal,
                taxAmount: totals.taxAmount,
                total: totals.total,
            };
        }
        else if (dueDate) {
            update = {
                dueDate,
            };
        }
        const updated = await this.invoiceRepo.update(invoiceId, update);
        if (!updated) {
            throw new app_error_1.AppError("Unable to update invoice", http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        }
        return this.toInvoiceResponse(updated);
    }
    async updateStatus(invoiceId, status) {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) {
            throw new app_error_1.AppError("Invoice not found", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        if (invoice.status === "PAID") {
            throw new app_error_1.AppError("Paid invoices cannot be modified", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        if (invoice.status === "CANCELLED") {
            throw new app_error_1.AppError("Cancelled invoices cannot be modified", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        this.validateStatusTransition(invoice.status, status);
        let paymentStatus = "UNPAID";
        let paidAt = null;
        if (status === "PAID") {
            paymentStatus = "PAID";
            paidAt = new Date();
        }
        const updated = await this.invoiceRepo.updateStatus(invoiceId, status, paymentStatus, paidAt);
        if (!updated) {
            throw new app_error_1.AppError("Unable to update invoice status", http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        }
        return this.toInvoiceResponse(updated);
    }
    async getSummary(userId, role) {
        if (role === roles_1.ROLES.ADMIN) {
            return this.invoiceRepo.getSummary();
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new app_error_1.AppError("Invalid user ID", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        return this.invoiceRepo.getSummary(userId);
    }
    calculateTotals(items, taxRate) {
        const subtotal = items.reduce((sum, item) => sum +
            item.quantity *
                item.unitPrice, 0);
        const taxAmount = Math.round((subtotal * taxRate) /
            100);
        const total = subtotal + taxAmount;
        return {
            subtotal,
            taxAmount,
            total,
        };
    }
    validateDates(issueDate, dueDate) {
        if (dueDate.getTime() <
            issueDate.getTime()) {
            throw new app_error_1.AppError("Due date cannot be before issue date", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
    }
    ensureClientOwnership(clientId, userId) {
        if (clientId.toString() !==
            userId) {
            throw new app_error_1.AppError("You are not authorized to access this invoice", http_status_codes_1.StatusCodes.FORBIDDEN);
        }
    }
    async generateInvoiceNumber() {
        const year = new Date().getFullYear();
        let invoiceNumber;
        do {
            const randomPart = Math.floor(100000 +
                Math.random() * 900000);
            invoiceNumber =
                `NEX-${year}-${randomPart}`;
        } while (await this.invoiceRepo.findByInvoiceNumber(invoiceNumber));
        return invoiceNumber;
    }
    toInvoiceResponse(invoice) {
        const clientId = invoice.clientId;
        let clientIdString;
        if (clientId &&
            typeof clientId === "object" &&
            "_id" in clientId) {
            clientIdString =
                clientId._id.toString();
        }
        else if (clientId) {
            clientIdString =
                clientId.toString();
        }
        else {
            clientIdString = "";
        }
        return {
            id: invoice._id.toString(),
            invoiceNumber: invoice.invoiceNumber,
            clientId: clientIdString,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            items: invoice.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
            })),
            subtotal: invoice.subtotal,
            taxRate: invoice.taxRate,
            taxAmount: invoice.taxAmount,
            total: invoice.total,
            currency: invoice.currency,
            status: this.getEffectiveStatus(invoice.status, invoice.dueDate, invoice.paymentStatus),
            paymentStatus: invoice.paymentStatus,
            paidAt: invoice.paidAt ?? null,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
        };
    }
    toInvoiceWithClientResponse(invoice) {
        const response = this.toInvoiceResponse(invoice);
        const client = invoice.clientId &&
            typeof invoice.clientId ===
                "object" &&
            "email" in invoice.clientId
            ? {
                id: invoice.clientId._id.toString(),
                name: invoice.clientId.name,
                email: invoice.clientId.email,
            }
            : null;
        return {
            ...response,
            client,
        };
    }
    getEffectiveStatus(status, dueDate, paymentStatus) {
        if (status === "ISSUED" &&
            paymentStatus === "UNPAID" &&
            dueDate.getTime() <
                Date.now()) {
            return "OVERDUE";
        }
        return status;
    }
    validateStatusTransition(currentStatus, newStatus) {
        if (currentStatus === "PAID" &&
            newStatus !== "PAID") {
            throw new app_error_1.AppError("Paid invoices cannot change status", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        if (currentStatus === "CANCELLED" &&
            newStatus !== "CANCELLED") {
            throw new app_error_1.AppError("Cancelled invoices cannot change status", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        if (currentStatus === "DRAFT" &&
            newStatus === "PAID") {
            throw new app_error_1.AppError("Draft invoices must be issued before payment", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        if (currentStatus === "ISSUED" &&
            newStatus === "CANCELLED") {
            return;
        }
        if (currentStatus === "DRAFT" &&
            newStatus === "ISSUED") {
            return;
        }
        if (currentStatus === "ISSUED" &&
            newStatus === "PAID") {
            return;
        }
        if (currentStatus === "DRAFT" &&
            newStatus === "CANCELLED") {
            return;
        }
        throw new app_error_1.AppError("Invalid invoice status transition", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
}
exports.invoiceService = new InvoiceService(invoice_repository_1.invoiceRepository);
