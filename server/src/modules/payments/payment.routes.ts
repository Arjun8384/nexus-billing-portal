import { Router } from "express";

import { authenticate } from "@/middleware/auth.middleware";
import { authorize } from "@/middleware/role.middleware";
import { ROLES } from "@/constants/roles";

import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create-checkout-session",
  authenticate,
  authorize(ROLES.CLIENT),
  paymentController.createCheckoutSession.bind(
    paymentController
  )
);

router.post(
  "/webhook",
  paymentController.handleWebhook.bind(
    paymentController
  )
);

export default router;