import { cleanEnv, port, str } from "envalid";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    default: "development",
    choices: ["development", "production"],
  }),

  PORT: port({
    default: 5000,
  }),

  MONGODB_URI: str(),

  JWT_SECRET: str(),

  JWT_EXPIRES_IN: str(),

  CLIENT_URL: str(),

  SMTP_HOST: str(),

  SMTP_PORT: port(),

  SMTP_USER: str(),

  SMTP_PASS: str(),

  STRIPE_SECRET_KEY: str({
    default: "",
  }),

  STRIPE_WEBHOOK_SECRET: str({
    default: "",
  }),
});