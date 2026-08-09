import "dotenv/config";
import bcrypt from "bcryptjs";

import { connectDB } from "@/config/db";
import { ROLES } from "@/constants/roles";
import { UserModel } from "@/modules/users/user.model";

async function seedUsers() {
  try {
    await connectDB();

    const passwordHash = await bcrypt.hash(
      "Admin@12345",
      12
    );

    const existingAdmin =
      await UserModel.findOne({
        email: "admin@nexus.local",
      });

    if (!existingAdmin) {
      await UserModel.create({
        name: "Nexus Administrator",
        email: "admin@nexus.local",
        password: passwordHash,
        role: ROLES.ADMIN,
        isActive: true,
      });

      console.log(
        "Admin user created: admin@nexus.local"
      );
    } else {
      console.log(
        "Admin user already exists"
      );
    }

    const clientPasswordHash =
      await bcrypt.hash(
        "Client@12345",
        12
      );

    const existingClient =
      await UserModel.findOne({
        email: "client@nexus.local",
      });

    if (!existingClient) {
      await UserModel.create({
        name: "Nexus Client",
        email: "client@nexus.local",
        password: clientPasswordHash,
        role: ROLES.CLIENT,
        isActive: true,
      });

      console.log(
        "Client user created: client@nexus.local"
      );
    } else {
      console.log(
        "Client user already exists"
      );
    }

    console.log("User seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error(
      "User seeding failed:",
      error
    );

    process.exit(1);
  }
}

seedUsers();