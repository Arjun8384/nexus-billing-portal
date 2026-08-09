import "dotenv/config";

import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`
========================================
🚀 Server Started
🌐 http://localhost:${env.PORT}
========================================
`);
  });
}

bootstrap();