import Stripe from "stripe";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import { ROLES, type UserRole } from "@/constants/roles";
import { stripe } from "@/config/stripe";
import { AppError } from "@/utils/app-error";

import {
  invoiceRepository,
  InvoiceRepository,
} from "@/modules/invoices/invoice.repository";

import {
  generateInvoicePdf,
} from "@/modules/invoices/invoice.pdf";

import {
  pdfToBuffer,
  sendPaymentReceipt,
} from "./payment.email";

class PaymentService {
  constructor(
    private readonly invoiceRepo: InvoiceRepository
  ) {}

  async createCheckoutSession(
    invoiceId: string,
    userId: string,
    role: UserRole
  ): Promise<{
    sessionId: string;
    checkoutUrl: string;
  }> {
    if (!stripe) {
      throw new AppError(
        "Stripe payment service is not configured",
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }

    if (!Types.ObjectId.isValid(invoiceId)) {
      throw new AppError(
        "Invalid invoice ID",
        StatusCodes.BAD_REQUEST
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        "Invalid user ID",
        StatusCodes.BAD_REQUEST
      );
    }

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
      if (
        invoice.clientId.toString() !==
        userId
      ) {
        throw new AppError(
          "You are not authorized to pay this invoice",
          StatusCodes.FORBIDDEN
        );
      }
    }

    if (invoice.status !== "ISSUED") {
      throw new AppError(
        "Only issued invoices can be paid",
        StatusCodes.BAD_REQUEST
      );
    }

    if (
      invoice.paymentStatus !== "UNPAID"
    ) {
      throw new AppError(
        "Invoice has already been paid",
        StatusCodes.BAD_REQUEST
      );
    }

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: ["card"],

        line_items: invoice.items.map(
          (item) => ({
            price_data: {
              currency:
                invoice.currency.toLowerCase(),

              product_data: {
                name: item.description,
              },

              unit_amount:
                Math.round(
                  item.unitPrice * 100
                ),
            },

            quantity: item.quantity,
          })
        ),

        metadata: {
          invoiceId:
            invoice._id.toString(),
        },

        success_url:
          `${process.env.CLIENT_URL}/client/payment/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${process.env.CLIENT_URL}/client/payment/cancelled`,
      });

    if (!session.url) {
      throw new AppError(
        "Unable to create Stripe checkout URL",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async handleWebhookEvent(
    event: Stripe.Event
  ): Promise<void> {
    if (
      event.type !==
      "checkout.session.completed"
    ) {
      return;
    }

    const session =
      event.data.object as Stripe.Checkout.Session;

    const invoiceId =
      session.metadata?.invoiceId;

    if (!invoiceId) {
      throw new AppError(
        "Invoice ID missing from Stripe session",
        StatusCodes.BAD_REQUEST
      );
    }

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
      invoice.paymentStatus === "PAID"
    ) {
      return;
    }

    const paidAt = new Date();

    const updated =
      await this.invoiceRepo.updateStatus(
        invoiceId,
        "PAID",
        "PAID",
        paidAt
      );

    if (!updated) {
      throw new AppError(
        "Unable to update invoice payment status",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const customerEmail =
      session.customer_details?.email;

    if (!customerEmail) {
      throw new AppError(
        "Customer email not found in Stripe checkout session",
        StatusCodes.BAD_REQUEST
      );
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

const invoicePdf =
  generateInvoicePdf(invoiceResponse);

    const pdfBuffer =
      await pdfToBuffer(invoicePdf);

    await sendPaymentReceipt(
      invoiceResponse,
      pdfBuffer,
      customerEmail
    );
  }
}

export const paymentService =
  new PaymentService(
    invoiceRepository
  );