"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const envalid_1 = require("envalid");
exports.env = (0, envalid_1.cleanEnv)(process.env, {
    NODE_ENV: (0, envalid_1.str)({
        default: "development",
        choices: ["development", "production"],
    }),
    PORT: (0, envalid_1.port)({
        default: 5000,
    }),
    MONGODB_URI: (0, envalid_1.str)(),
    JWT_SECRET: (0, envalid_1.str)(),
    JWT_EXPIRES_IN: (0, envalid_1.str)(),
    CLIENT_URL: (0, envalid_1.str)(),
    SMTP_HOST: (0, envalid_1.str)(),
    SMTP_PORT: (0, envalid_1.port)(),
    SMTP_USER: (0, envalid_1.str)(),
    SMTP_PASS: (0, envalid_1.str)(),
    STRIPE_SECRET_KEY: (0, envalid_1.str)({
        default: "",
    }),
    STRIPE_WEBHOOK_SECRET: (0, envalid_1.str)({
        default: "",
    }),
});
