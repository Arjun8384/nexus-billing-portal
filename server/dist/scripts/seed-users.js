"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const roles_1 = require("../constants/roles");
const user_model_1 = require("../modules/users/user.model");
async function seedUsers() {
    try {
        await (0, db_1.connectDB)();
        const passwordHash = await bcryptjs_1.default.hash("Admin@12345", 12);
        const existingAdmin = await user_model_1.UserModel.findOne({
            email: "admin@nexus.local",
        });
        if (!existingAdmin) {
            await user_model_1.UserModel.create({
                name: "Nexus Administrator",
                email: "admin@nexus.local",
                password: passwordHash,
                role: roles_1.ROLES.ADMIN,
                isActive: true,
            });
            console.log("Admin user created: admin@nexus.local");
        }
        else {
            console.log("Admin user already exists");
        }
        const clientPasswordHash = await bcryptjs_1.default.hash("Client@12345", 12);
        const existingClient = await user_model_1.UserModel.findOne({
            email: "client@nexus.local",
        });
        if (!existingClient) {
            await user_model_1.UserModel.create({
                name: "Nexus Client",
                email: "client@nexus.local",
                password: clientPasswordHash,
                role: roles_1.ROLES.CLIENT,
                isActive: true,
            });
            console.log("Client user created: client@nexus.local");
        }
        else {
            console.log("Client user already exists");
        }
        console.log("User seeding completed.");
        process.exit(0);
    }
    catch (error) {
        console.error("User seeding failed:", error);
        process.exit(1);
    }
}
seedUsers();
