import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";

import { env } from "@/config/env";
import { stripe } from "@/config/stripe";
import type { AuthenticatedRequest } from "@/middleware/auth.middleware";

import { paymentService } from "./payment.service";
import type {
  CreateCheckoutInput,
} from "./payment.types";

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

class PaymentController {
  async createCheckoutSession(
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

    const input =
      req.body as CreateCheckoutInput;

    if (
      !input.invoiceId ||
      typeof input.invoiceId !==
        "string"
    ) {
      res.status(
        StatusCodes.BAD_REQUEST
      ).json({
        success: false,
        message:
          "Invoice ID is required",
      });

      return;
    }

    const session =
      await paymentService.createCheckoutSession(
        input.invoiceId,
        req.user.userId,
        req.user.role
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Checkout session created successfully",
      data: session,
    });
  }

  async handleWebhook(
    req: RawBodyRequest,
    res: Response
  ): Promise<void> {
    if (!stripe) {
      res.status(
        StatusCodes.SERVICE_UNAVAILABLE
      ).json({
        success: false,
        message:
          "Stripe payment service is not configured",
      });

      return;
    }

    if (!env.STRIPE_WEBHOOK_SECRET) {
      res.status(
        StatusCodes.SERVICE_UNAVAILABLE
      ).json({
        success: false,
        message:
          "Stripe webhook secret is not configured",
      });

      return;
    }

    if (!req.rawBody) {
      res.status(
        StatusCodes.BAD_REQUEST
      ).json({
        success: false,
        message:
          "Raw request body is required",
      });

      return;
    }

    const signature =
      req.headers["stripe-signature"];

    if (!signature) {
      res.status(
        StatusCodes.BAD_REQUEST
      ).json({
        success: false,
        message:
          "Stripe signature is missing",
      });

      return;
    }

    let event: Stripe.Event;

    try {
      event =
        stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          env.STRIPE_WEBHOOK_SECRET
        );
    } catch {
      res.status(
        StatusCodes.BAD_REQUEST
      ).json({
        success: false,
        message:
          "Invalid Stripe webhook signature",
      });

      return;
    }

    await paymentService.handleWebhookEvent(
      event
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Stripe webhook processed successfully",
    });
  }
}

export const paymentController =
  new PaymentController();