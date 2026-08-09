"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfToBuffer = pdfToBuffer;
exports.sendPaymentReceipt = sendPaymentReceipt;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
function pdfToBuffer(pdf) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        pdf.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdf.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        pdf.on("error", reject);
    });
}
async function sendPaymentReceipt(invoice, pdfBuffer, recipientEmail) {
    if (!process.env.SMTP_USER ||
        !process.env.SMTP_PASS) {
        throw new Error("SMTP email configuration is missing");
    }
    const from = process.env.SMTP_FROM ||
        process.env.SMTP_USER;
    await transporter.sendMail({
        from,
        to: recipientEmail,
        subject: `Payment Receipt - ${invoice.invoiceNumber}`,
        text: `Dear Customer,\n\n` +
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
                filename: `${invoice.invoiceNumber}-receipt.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
}
