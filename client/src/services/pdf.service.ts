import { API_URL } from "@/lib/api";

export async function downloadInvoicePdf(
  invoiceId: string,
  invoiceNumber: string
): Promise<void> {
  const response =
    await fetch(
      `${API_URL}/invoices/${invoiceId}/pdf`,
      {
        credentials: "include",
      }
    );

  if (!response.ok) {
    const data =
      await response.json();

    throw new Error(
      data.message ||
        "Unable to download invoice PDF"
    );
  }

  const blob =
    await response.blob();

  const url =
    window.URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement("a");

  anchor.href = url;

  anchor.download =
    `${invoiceNumber}.pdf`;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  window.URL.revokeObjectURL(
    url
  );
}