export interface CreateCheckoutInput {
  invoiceId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string | null;
}