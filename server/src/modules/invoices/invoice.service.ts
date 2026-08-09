import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import {
  ROLES,
  type UserRole,
} from "@/constants/roles";
import { AppError } from "@/utils/app-error";

import {
  InvoiceRepository,
  type InvoiceUpdate,
  invoiceRepository,
} from "./invoice.repository";

import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "./invoice.schema";

import type {
  InvoiceResponse,
  InvoiceWithClient,
  InvoiceTotals,
  InvoiceItemInput,
  InvoiceStatus,
  PaymentStatus,
} from "./invoice.types";

class InvoiceService {
  constructor(
    private readonly invoiceRepo: InvoiceRepository
  ) {}

  async createInvoice(
    input: CreateInvoiceInput
  ): Promise<InvoiceResponse> {
    const issueDate = new Date(
      input.issueDate
    );

    const dueDate = new Date(
      input.dueDate
    );

    if (
      Number.isNaN(issueDate.getTime()) ||
      Number.isNaN(dueDate.getTime())
    ) {
      throw new AppError(
        "Invalid invoice date",
        StatusCodes.BAD_REQUEST
      );
    }

    this.validateDates(
      issueDate,
      dueDate
    );

    if (
      !Types.ObjectId.isValid(
        input.clientId
      )
    ) {
      throw new AppError(
        "Invalid client ID",
        StatusCodes.BAD_REQUEST
      );
    }

    const totals =
      this.calculateTotals(
        input.items,
        input.taxRate
      );

    const invoiceNumber =
      await this.generateInvoiceNumber();

    const invoice =
      await this.invoiceRepo.create({
        invoiceNumber,
        clientId: new Types.ObjectId(
          input.clientId
        ),
        issueDate,
        dueDate,
        items: input.items.map((item) => ({
          description:
            item.description,
          quantity:
            item.quantity,
          unitPrice:
            item.unitPrice,
          amount:
            item.quantity *
            item.unitPrice,
        })),
        subtotal:
          totals.subtotal,
        taxRate:
          input.taxRate,
        taxAmount:
          totals.taxAmount,
        total:
          totals.total,
        currency:
          input.currency,
        status: "DRAFT",
        paymentStatus: "UNPAID",
        paidAt: null,
      });

    return this.toInvoiceResponse(
      invoice
    );
  }

  async getInvoiceById(
    invoiceId: string,
    userId: string,
    role: UserRole
  ): Promise<InvoiceWithClient> {
    const invoice =
      await this.invoiceRepo.findById(
        invoiceId
      );

    if (!invoice) {
      throw new AppError(
        "Invoice not found",
        StatusCodes.NOT_FOUND
      );
    }

    if (role === ROLES.CLIENT) {
      this.ensureClientOwnership(
        invoice.clientId,
        userId
      );
    }

    return this.toInvoiceWithClientResponse(
      invoice
    );
  }

  async getInvoices(
    userId: string,
    role: UserRole
  ): Promise<InvoiceResponse[]> {
    if (role === ROLES.ADMIN) {
      const invoices =
        await this.invoiceRepo.findAll();

      return invoices.map((invoice) =>
        this.toInvoiceResponse(
          invoice
        )
      );
    }

    if (
      !Types.ObjectId.isValid(userId)
    ) {
      throw new AppError(
        "Invalid user ID",
        StatusCodes.BAD_REQUEST
      );
    }

    const invoices =
      await this.invoiceRepo.findByClientId(
        userId
      );

    return invoices.map((invoice) =>
      this.toInvoiceResponse(
        invoice
      )
    );
  }

  async updateInvoice(
    invoiceId: string,
    input: UpdateInvoiceInput
  ): Promise<InvoiceResponse> {
    const invoice =
      await this.invoiceRepo.findById(
        invoiceId
      );

    if (!invoice) {
      throw new AppError(
        "Invoice not found",
        StatusCodes.NOT_FOUND
      );
    }

    if (
      invoice.status === "PAID"
    ) {
      throw new AppError(
        "Paid invoices cannot be modified",
        StatusCodes.BAD_REQUEST
      );
    }

    if (
      invoice.status === "CANCELLED"
    ) {
      throw new AppError(
        "Cancelled invoices cannot be modified",
        StatusCodes.BAD_REQUEST
      );
    }

    let dueDate: Date | undefined;

    if (input.dueDate) {
      dueDate = new Date(
        input.dueDate
      );

      if (
        Number.isNaN(
          dueDate.getTime()
        )
      ) {
        throw new AppError(
          "Invalid due date",
          StatusCodes.BAD_REQUEST
        );
      }

      this.validateDates(
        invoice.issueDate,
        dueDate
      );
    }

    let update: InvoiceUpdate = {};

    if (
      input.items ||
      input.taxRate !== undefined
    ) {
      const items: InvoiceItemInput[] =
        input.items ??
        invoice.items.map((item) => ({
          description:
            item.description,
          quantity:
            item.quantity,
          unitPrice:
            item.unitPrice,
        }));

      const taxRate =
        input.taxRate ??
        invoice.taxRate;

      const totals =
        this.calculateTotals(
          items,
          taxRate
        );

      update = {
        ...(dueDate && {
          dueDate,
        }),

        items: items.map((item) => ({
          description:
            item.description,
          quantity:
            item.quantity,
          unitPrice:
            item.unitPrice,
          amount:
            item.quantity *
            item.unitPrice,
        })),

        taxRate,

        subtotal:
          totals.subtotal,

        taxAmount:
          totals.taxAmount,

        total:
          totals.total,
      };
    } else if (dueDate) {
      update = {
        dueDate,
      };
    }

    const updated =
      await this.invoiceRepo.update(
        invoiceId,
        update
      );

    if (!updated) {
      throw new AppError(
        "Unable to update invoice",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return this.toInvoiceResponse(
      updated
    );
  }

  async updateStatus(
    invoiceId: string,
    status:
      | "ISSUED"
      | "PAID"
      | "CANCELLED"
  ): Promise<InvoiceResponse> {
    const invoice =
      await this.invoiceRepo.findById(
        invoiceId
      );

    if (!invoice) {
      throw new AppError(
        "Invoice not found",
        StatusCodes.NOT_FOUND
      );
    }

    if (
      invoice.status === "PAID"
    ) {
      throw new AppError(
        "Paid invoices cannot be modified",
        StatusCodes.BAD_REQUEST
      );
    }

    if (
      invoice.status === "CANCELLED"
    ) {
      throw new AppError(
        "Cancelled invoices cannot be modified",
        StatusCodes.BAD_REQUEST
      );
    }

    this.validateStatusTransition(
      invoice.status,
      status
    );

    let paymentStatus:
      | "UNPAID"
      | "PAID" = "UNPAID";

    let paidAt: Date | null = null;

    if (status === "PAID") {
      paymentStatus = "PAID";
      paidAt = new Date();
    }

    const updated =
      await this.invoiceRepo.updateStatus(
        invoiceId,
        status,
        paymentStatus,
        paidAt
      );

    if (!updated) {
      throw new AppError(
        "Unable to update invoice status",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return this.toInvoiceResponse(
      updated
    );
  }

  async getSummary(
    userId: string,
    role: UserRole
  ) {
    if (role === ROLES.ADMIN) {
      return this.invoiceRepo.getSummary();
    }

    if (
      !Types.ObjectId.isValid(userId)
    ) {
      throw new AppError(
        "Invalid user ID",
        StatusCodes.BAD_REQUEST
      );
    }

    return this.invoiceRepo.getSummary(
      userId
    );
  }

  private calculateTotals(
    items: InvoiceItemInput[],
    taxRate: number
  ): InvoiceTotals {
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        item.quantity *
          item.unitPrice,
      0
    );

    const taxAmount =
      Math.round(
        (subtotal * taxRate) /
          100
      );

    const total =
      subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      total,
    };
  }

  private validateDates(
    issueDate: Date,
    dueDate: Date
  ): void {
    if (
      dueDate.getTime() <
      issueDate.getTime()
    ) {
      throw new AppError(
        "Due date cannot be before issue date",
        StatusCodes.BAD_REQUEST
      );
    }
  }

  private ensureClientOwnership(
    clientId: Types.ObjectId,
    userId: string
  ): void {
    if (
      clientId.toString() !==
      userId
    ) {
      throw new AppError(
        "You are not authorized to access this invoice",
        StatusCodes.FORBIDDEN
      );
    }
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year =
      new Date().getFullYear();

    let invoiceNumber: string;

    do {
      const randomPart =
        Math.floor(
          100000 +
            Math.random() * 900000
        );

      invoiceNumber =
        `NEX-${year}-${randomPart}`;
    } while (
      await this.invoiceRepo.findByInvoiceNumber(
        invoiceNumber
      )
    );

    return invoiceNumber;
  }

  private toInvoiceResponse(
    invoice: any
  ): InvoiceResponse {
    const clientId =
      invoice.clientId;

    let clientIdString: string;

    if (
      clientId &&
      typeof clientId === "object" &&
      "_id" in clientId
    ) {
      clientIdString =
        clientId._id.toString();
    } else if (clientId) {
      clientIdString =
        clientId.toString();
    } else {
      clientIdString = "";
    }

    return {
      id: invoice._id.toString(),

      invoiceNumber:
        invoice.invoiceNumber,

      clientId:
        clientIdString,

      issueDate:
        invoice.issueDate,

      dueDate:
        invoice.dueDate,

      items: invoice.items.map(
        (item: any) => ({
          description:
            item.description,

          quantity:
            item.quantity,

          unitPrice:
            item.unitPrice,

          amount:
            item.amount,
        })
      ),

      subtotal:
        invoice.subtotal,

      taxRate:
        invoice.taxRate,

      taxAmount:
        invoice.taxAmount,

      total:
        invoice.total,

      currency:
        invoice.currency,

      status:
        this.getEffectiveStatus(
          invoice.status,
          invoice.dueDate,
          invoice.paymentStatus
        ),

      paymentStatus:
        invoice.paymentStatus,

      paidAt:
        invoice.paidAt ?? null,

      createdAt:
        invoice.createdAt,

      updatedAt:
        invoice.updatedAt,
    };
  }

  private toInvoiceWithClientResponse(
    invoice: any
  ): InvoiceWithClient {
    const response =
      this.toInvoiceResponse(
        invoice
      );

    const client =
      invoice.clientId &&
      typeof invoice.clientId ===
        "object" &&
      "email" in invoice.clientId
        ? {
            id: invoice.clientId._id.toString(),
            name:
              invoice.clientId.name,
            email:
              invoice.clientId.email,
          }
        : null;

    return {
      ...response,
      client,
    };
  }

  private getEffectiveStatus(
    status: InvoiceStatus,
    dueDate: Date,
    paymentStatus: PaymentStatus
  ): InvoiceStatus {
    if (
      status === "ISSUED" &&
      paymentStatus === "UNPAID" &&
      dueDate.getTime() <
        Date.now()
    ) {
      return "OVERDUE";
    }

    return status;
  }

  private validateStatusTransition(
    currentStatus: InvoiceStatus,
    newStatus: InvoiceStatus
  ): void {
    if (
      currentStatus === "PAID" &&
      newStatus !== "PAID"
    ) {
      throw new AppError(
        "Paid invoices cannot change status",
        StatusCodes.BAD_REQUEST
      );
    }

    if (
      currentStatus === "CANCELLED" &&
      newStatus !== "CANCELLED"
    ) {
      throw new AppError(
        "Cancelled invoices cannot change status",
        StatusCodes.BAD_REQUEST
      );
    }

    if (
      currentStatus === "DRAFT" &&
      newStatus === "PAID"
    ) {
      throw new AppError(
        "Draft invoices must be issued before payment",
        StatusCodes.BAD_REQUEST
      );
    }

    if (
      currentStatus === "ISSUED" &&
      newStatus === "CANCELLED"
    ) {
      return;
    }

    if (
      currentStatus === "DRAFT" &&
      newStatus === "ISSUED"
    ) {
      return;
    }

    if (
      currentStatus === "ISSUED" &&
      newStatus === "PAID"
    ) {
      return;
    }

    if (
      currentStatus === "DRAFT" &&
      newStatus === "CANCELLED"
    ) {
      return;
    }

    throw new AppError(
      "Invalid invoice status transition",
      StatusCodes.BAD_REQUEST
    );
  }
}

export const invoiceService =
  new InvoiceService(
    invoiceRepository
  );