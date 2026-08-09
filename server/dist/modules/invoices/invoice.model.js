"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceModel = void 0;
const mongoose_1 = require("mongoose");
const invoiceItemSchema = new mongoose_1.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    _id: false,
});
const invoiceSchema = new mongoose_1.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    clientId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    issueDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    items: {
        type: [invoiceItemSchema],
        required: true,
        validate: {
            validator: (items) => items.length > 0,
            message: "Invoice must contain at least one item",
        },
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    taxRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
    },
    taxAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
        default: "USD",
    },
    status: {
        type: String,
        enum: [
            "DRAFT",
            "ISSUED",
            "PAID",
            "OVERDUE",
            "CANCELLED",
        ],
        default: "DRAFT",
        index: true,
    },
    paymentStatus: {
        type: String,
        enum: ["UNPAID", "PAID"],
        default: "UNPAID",
        index: true,
    },
    paidAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
exports.InvoiceModel = (0, mongoose_1.model)("Invoice", invoiceSchema);
