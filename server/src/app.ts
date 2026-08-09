import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "@/modules/users/user.routes";
import { invoiceRoutes } from "@/modules/invoices/invoice.routes";
import paymentRoutes from "@/modules/payments/payment.routes";
import { paymentController } from "@/modules/payments/payment.controller";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(helmet());

app.use(compression());

app.use(morgan("dev"));

app.use(cookieParser());

app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
  }),
  paymentController.handleWebhook.bind(
    paymentController
  )
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/invoices", invoiceRoutes);

app.use("/api/payments", paymentRoutes);

app.use(errorMiddleware);

app.get("/api/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server running successfully",
  });
});

export default app;