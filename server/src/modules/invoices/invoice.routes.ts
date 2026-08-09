import { Router } from "express";

import {
  authenticate,
} from "@/middleware/auth.middleware";
import {
  authorize,
} from "@/middleware/role.middleware";
import { ROLES } from "@/constants/roles";

import { invoiceController } from "./invoice.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.ADMIN),
  invoiceController.createInvoice.bind(invoiceController)
);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.CLIENT),
  invoiceController.getInvoices.bind(invoiceController)
);

router.get(
  "/summary",
  authorize(
    ROLES.ADMIN,
    ROLES.CLIENT
  ),
  invoiceController.getSummary.bind(
    invoiceController
  )
);

router.get(
  "/:invoiceId",
  authorize(ROLES.ADMIN, ROLES.CLIENT),
  invoiceController.getInvoiceById.bind(invoiceController)
);

router.patch(
  "/:invoiceId",
  authorize(ROLES.ADMIN),
  invoiceController.updateInvoice.bind(invoiceController)
);

router.get(
  "/:invoiceId/pdf",
  authorize(
    ROLES.ADMIN,
    ROLES.CLIENT
  ),
  invoiceController.generatePdf.bind(
    invoiceController
  )
);

router.patch(
  "/:invoiceId/status",
  authorize(ROLES.ADMIN),
  invoiceController.updateStatus.bind(
    invoiceController
  )
);

router.get(
  "/:invoiceId/pdf",
  authorize(
    ROLES.ADMIN,
    ROLES.CLIENT
  ),
  invoiceController.generatePdf.bind(
    invoiceController
  )
);

router.get(
  "/:invoiceId",
  authorize(
    ROLES.ADMIN,
    ROLES.CLIENT
  ),
  invoiceController.getInvoiceById.bind(
    invoiceController
  )
);

export { router as invoiceRoutes };