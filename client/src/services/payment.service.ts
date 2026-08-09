import { apiFetch } from "@/lib/api";

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function createCheckoutSession(
  invoiceId: string
): Promise<CheckoutSessionResponse> {
  const response =
    await apiFetch<
      ApiResponse<CheckoutSessionResponse>
    >(
      "/api/payments/create-checkout-session",
      {
        method: "POST",
        body: JSON.stringify({
          invoiceId,
        }),
      }
    );

  return response.data;
}