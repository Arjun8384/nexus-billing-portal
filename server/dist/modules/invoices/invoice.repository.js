"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRepository = exports.InvoiceRepository = void 0;
const mongoose_1 = require("mongoose");
const invoice_model_1 = require("./invoice.model");
class InvoiceRepository {
    async create(invoice) {
        const document = await invoice_model_1.InvoiceModel.create(invoice);
        return document;
    }
    async findById(invoiceId) {
        const document = await invoice_model_1.InvoiceModel.findById(invoiceId).populate("clientId", "name email role");
        return document;
    }
    async findByClientId(clientId) {
        const documents = await invoice_model_1.InvoiceModel.find({
            clientId: new mongoose_1.Types.ObjectId(clientId),
        }).sort({
            createdAt: -1,
        });
        return documents;
    }
    async findAll() {
        const documents = await invoice_model_1.InvoiceModel.find()
            .populate("clientId", "name email role")
            .sort({
            createdAt: -1,
        });
        return documents;
    }
    async update(invoiceId, update) {
        const document = await invoice_model_1.InvoiceModel.findByIdAndUpdate(invoiceId, {
            $set: update,
        }, {
            new: true,
            runValidators: true,
        });
        return document;
    }
    async findByInvoiceNumber(invoiceNumber) {
        const document = await invoice_model_1.InvoiceModel.findOne({
            invoiceNumber,
        });
        return document;
    }
    async updateStatus(invoiceId, status, paymentStatus, paidAt) {
        const document = await invoice_model_1.InvoiceModel.findByIdAndUpdate(invoiceId, {
            $set: {
                status,
                paymentStatus,
                paidAt,
            },
        }, {
            new: true,
            runValidators: true,
        }).populate("clientId", "name email role");
        return document;
    }
    async getSummary(clientId) {
        const matchStage = clientId
            ? {
                clientId: new mongoose_1.Types.ObjectId(clientId),
            }
            : {};
        const result = await invoice_model_1.InvoiceModel.aggregate([
            {
                $match: matchStage,
            },
            {
                $addFields: {
                    effectiveStatus: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $eq: [
                                            "$status",
                                            "ISSUED",
                                        ],
                                    },
                                    {
                                        $eq: [
                                            "$paymentStatus",
                                            "UNPAID",
                                        ],
                                    },
                                    {
                                        $lt: [
                                            "$dueDate",
                                            new Date(),
                                        ],
                                    },
                                ],
                            },
                            "OVERDUE",
                            "$status",
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalInvoices: {
                        $sum: 1,
                    },
                    draft: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$effectiveStatus",
                                        "DRAFT",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    issued: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$effectiveStatus",
                                        "ISSUED",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    paid: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$effectiveStatus",
                                        "PAID",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$effectiveStatus",
                                        "OVERDUE",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    cancelled: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$effectiveStatus",
                                        "CANCELLED",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    totalBilled: {
                        $sum: {
                            $cond: [
                                {
                                    $ne: [
                                        "$effectiveStatus",
                                        "CANCELLED",
                                    ],
                                },
                                "$total",
                                0,
                            ],
                        },
                    },
                    totalPaid: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$paymentStatus",
                                        "PAID",
                                    ],
                                },
                                "$total",
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalInvoices: 1,
                    draft: 1,
                    issued: 1,
                    paid: 1,
                    overdue: 1,
                    cancelled: 1,
                    totalBilled: 1,
                    totalPaid: 1,
                    totalOutstanding: {
                        $subtract: [
                            "$totalBilled",
                            "$totalPaid",
                        ],
                    },
                },
            },
        ]);
        return (result[0] ?? {
            totalInvoices: 0,
            draft: 0,
            issued: 0,
            paid: 0,
            overdue: 0,
            cancelled: 0,
            totalBilled: 0,
            totalPaid: 0,
            totalOutstanding: 0,
        });
    }
}
exports.InvoiceRepository = InvoiceRepository;
exports.invoiceRepository = new InvoiceRepository();
