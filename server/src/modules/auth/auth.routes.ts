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
  login,
  logout,
  refresh,
} from "./auth.controller";

const router = Router();

router.post(
  "/login",
  asyncHandler(login)
);

router.post(
  "/refresh",
  asyncHandler(refresh)
);

router.post(
  "/logout",
  asyncHandler(logout)
);

// Temporary security verification routes.
// Remove these after B.3 testing is complete.
router.get(
  "/admin-test",
  authenticate,
  authorize(ROLES.ADMIN),
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  }
);

router.get(
  "/client-test",
  authenticate,
  authorize(ROLES.CLIENT),
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Client access granted",
    });
  }
);

export default router;