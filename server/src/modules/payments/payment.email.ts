import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

import type { InvoiceResponse } from "@/modules/invoices/invoice.types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type PdfDocumentInstance = InstanceType<
  typeof PDFDocument
>;

export function pdfToBuffer(
  pdf: PdfDocumentInstance
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    pdf.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    pdf.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    pdf.on("error", reject);
  });
}

export async function sendPaymentReceipt(
  invoice: InvoiceResponse,
  pdfBuffer: Buffer,
  recipientEmail: string
): Promise<void> {
  if (
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error(
      "SMTP email configuration is missing"
    );
  }

  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: recipientEmail,
    subject:
      `Payment Receipt - ${invoice.invoiceNumber}`,

    text:
      `Dear Customer,\n\n` +
      `Your payment for invoice ` +
      `${invoice.invoiceNumber} has been received successfully.\n\n` +
      `Amount Paid: ${invoice.total} ${invoice.currency}\n` +
      `Payment Status: ${invoice.paymentStatus}\n\n` +
      `Please find your payment receipt attached as a PDF.\n\n` +
      `Regards,\n` +
      `Nexus Billing Portal`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Payment Successful</h2>

        <p>
          Your payment for invoice
          <strong>${invoice.invoiceNumber}</strong>
          has been received successfully.
        </p>

        <p>
          <strong>Amount Paid:</strong>
          ${invoice.total} ${invoice.currency}
        </p>

        <p>
          <strong>Payment Status:</strong>
          ${invoice.paymentStatus}
        </p>

        <p>
          Your payment receipt is attached to this
          email as a PDF.
        </p>

        <p>
          Regards,<br />
          <strong>Nexus Billing Portal</strong>
        </p>
      </div>
    `,

    attachments: [
      {
        filename:
          `${invoice.invoiceNumber}-receipt.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}