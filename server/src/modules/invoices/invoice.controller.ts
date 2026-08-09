import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { invoiceService } from "./invoice.service";
import { generateInvoicePdf } from "./invoice.pdf";
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "./invoice.schema";

class InvoiceController {
  async createInvoice(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const input = req.body as CreateInvoiceInput;

    const invoice =
      await invoiceService.createInvoice(input);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  }

  async getInvoices(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const invoices =
      await invoiceService.getInvoices(
        req.user.userId,
        req.user.role
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Invoices retrieved successfully",
      data: invoices,
    });
  }

  async getInvoiceById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { invoiceId } = req.params;

    if (typeof invoiceId !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid invoice ID",
      });
      return;
    }

    const invoice =
      await invoiceService.getInvoiceById(
        invoiceId,
        req.user.userId,
        req.user.role
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Invoice retrieved successfully",
      data: invoice,
    });
  }

  async updateInvoice(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { invoiceId } = req.params;

    if (typeof invoiceId !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid invoice ID",
      });
      return;
    }

    const input = req.body as UpdateInvoiceInput;

    const invoice =
      await invoiceService.updateInvoice(
        invoiceId,
        input
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  }

  async generatePdf(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(
      StatusCodes.UNAUTHORIZED
    ).json({
      success: false,
      message:
        "Authentication required",
    });

    return;
  }

  const invoiceId =
    req.params.invoiceId;

  if (
    typeof invoiceId !== "string"
  ) {
    res.status(
      StatusCodes.BAD_REQUEST
    ).json({
      success: false,
      message: "Invalid invoice ID",
    });

    return;
  }

  const invoice =
    await invoiceService.getInvoiceById(
      invoiceId,
      req.user.userId,
      req.user.role
    );

  const pdf =
    generateInvoicePdf(invoice);

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoice.invoiceNumber}.pdf"`
  );

  pdf.pipe(res);
}

async updateStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(
      StatusCodes.UNAUTHORIZED
    ).json({
      success: false,
      message:
        "Authentication required",
    });

    return;
  }

  const invoiceId =
    req.params.invoiceId;

  if (
    typeof invoiceId !== "string"
  ) {
    res.status(
      StatusCodes.BAD_REQUEST
    ).json({
      success: false,
      message: "Invalid invoice ID",
    });

    return;
  }

  const status = req.body.status;

  if (
    status !== "ISSUED" &&
    status !== "PAID" &&
    status !== "CANCELLED"
  ) {
    res.status(
      StatusCodes.BAD_REQUEST
    ).json({
      success: false,
      message:
        "Invalid invoice status",
    });

    return;
  }

  const invoice =
    await invoiceService.updateStatus(
      invoiceId,
      status
    );

  res.status(StatusCodes.OK).json({
    success: true,
    message:
      "Invoice status updated successfully",
    data: invoice,
  });
}

async getSummary(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(
      StatusCodes.UNAUTHORIZED
    ).json({
      success: false,
      message:
        "Authentication required",
    });

    return;
  }

  const summary =
    await invoiceService.getSummary(
      req.user.userId,
      req.user.role
    );

  res.status(StatusCodes.OK).json({
    success: true,
    message:
      "Invoice summary retrieved successfully",
    data: summary,
  });
}
}

export const invoiceController =
  new InvoiceController();
