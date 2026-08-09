"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roles_1 = require("../../constants/roles");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const async_handler_1 = require("../../utils/async-handler");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post("/login", (0, async_handler_1.asyncHandler)(auth_controller_1.login));
router.post("/refresh", (0, async_handler_1.asyncHandler)(auth_controller_1.refresh));
router.post("/logout", (0, async_handler_1.asyncHandler)(auth_controller_1.logout));
// Temporary security verification routes.
// Remove these after B.3 testing is complete.
router.get("/admin-test", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(roles_1.ROLES.ADMIN), (_req, res) => {
    return res.status(200).json({
        success: true,
        message: "Admin access granted",
    });
});
router.get("/client-test", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(roles_1.ROLES.CLIENT), (_req, res) => {
    return res.status(200).json({
        success: true,
        message: "Client access granted",
    });
});
exports.default = router;
