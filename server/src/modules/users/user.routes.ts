import { Router } from "express";

import { ROLES } from "@/constants/roles";
import {
  authenticate,
} from "@/middleware/auth.middleware";
import {
  authorize,
} from "@/middleware/role.middleware";
import { asyncHandler } from "@/utils/async-handler";

import {
  createClient,
  getClientById,
  getClients,
  updateClient,
  updateClientStatus,
} from "./user.controller";

const router = Router();

router.use(
  authenticate,
  authorize(ROLES.ADMIN)
);

router.post(
  "/clients",
  asyncHandler(createClient)
);

router.get(
  "/clients",
  asyncHandler(getClients)
);

router.get(
  "/clients/:id",
  asyncHandler(getClientById)
);

router.patch(
  "/clients/:id",
  asyncHandler(updateClient)
);

router.patch(
  "/clients/:id/status",
  asyncHandler(updateClientStatus)
);

export default router;