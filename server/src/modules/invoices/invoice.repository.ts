import { Types } from "mongoose";

import {
  InvoiceModel,
  type Invoice,
  type InvoiceDocument,
  type InvoiceItem,
} from "./invoice.model";

export interface InvoiceUpdate {
  dueDate?: Date;
  items?: InvoiceItem[];
  taxRate?: number;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
}

export class InvoiceRepository {
  async create(
    invoice: Invoice
  ): Promise<InvoiceDocument> {
    const document =
      await InvoiceModel.create(invoice);

    return document as InvoiceDocument;
  }

  async findById(
    invoiceId: string
  ): Promise<InvoiceDocument | null> {
    const document =
      await InvoiceModel.findById(
        invoiceId
      ).populate(
        "clientId",
        "name email role"
      );

    return document as InvoiceDocument | null;
  }

  async findByClientId(
    clientId: string
  ): Promise<InvoiceDocument[]> {
    const documents =
      await InvoiceModel.find({
        clientId: new Types.ObjectId(
          clientId
        ),
      }).sort({
        createdAt: -1,
      });

    return documents as InvoiceDocument[];
  }

  async findAll(): Promise<
    InvoiceDocument[]
  > {
    const documents =
      await InvoiceModel.find()
        .populate(
          "clientId",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    return documents as InvoiceDocument[];
  }

  async update(
    invoiceId: string,
    update: InvoiceUpdate
  ): Promise<InvoiceDocument | null> {
    const document =
      await InvoiceModel.findByIdAndUpdate(
        invoiceId,
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    return document as InvoiceDocument | null;
  }

  async findByInvoiceNumber(
    invoiceNumber: string
  ): Promise<InvoiceDocument | null> {
    const document =
      await InvoiceModel.findOne({
        invoiceNumber,
      });

    return document as InvoiceDocument | null;
  }

async updateStatus(
  invoiceId: string,
  status:
    | "DRAFT"
    | "ISSUED"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED",
  paymentStatus:
    | "UNPAID"
    | "PAID",
  paidAt: Date | null
): Promise<InvoiceDocument | null> {
  const document =
    await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      {
        $set: {
          status,
          paymentStatus,
          paidAt,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "clientId",
      "name email role"
    );

  return document as InvoiceDocument | null;
}

  async getSummary(
    clientId?: string
  ) {
    const matchStage =
      clientId
        ? {
            clientId:
              new Types.ObjectId(
                clientId
              ),
          }
        : {};

    const result =
      await InvoiceModel.aggregate([
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

    return (
      result[0] ?? {
        totalInvoices: 0,
        draft: 0,
        issued: 0,
        paid: 0,
        overdue: 0,
        cancelled: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
      }
    );
  }
}

export const invoiceRepository =
  new InvoiceRepository();