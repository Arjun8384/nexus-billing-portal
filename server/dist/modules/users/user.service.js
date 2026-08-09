"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = require("http-status-codes");
const roles_1 = require("../../constants/roles");
const app_error_1 = require("../../utils/app-error");
const user_repository_1 = require("./user.repository");
class UserService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async createClient(input) {
        const existingUser = await this.userRepo.findByEmail(input.email);
        if (existingUser) {
            throw new app_error_1.AppError("A user with this email already exists", http_status_codes_1.StatusCodes.CONFLICT);
        }
        const hashedPassword = await bcryptjs_1.default.hash(input.password, 12);
        const user = await this.userRepo.create({
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: roles_1.ROLES.CLIENT,
            isActive: true,
            refreshToken: null,
            lastLogin: null,
        });
        return this.toClientResponse(user);
    }
    async getClients() {
        const users = await this.userRepo.findClients();
        return users.map((user) => this.toClientResponse(user));
    }
    async getClientById(userId) {
        const user = await this.userRepo.findClientById(userId);
        if (!user) {
            throw new app_error_1.AppError("Client not found", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        return this.toClientResponse(user);
    }
    async updateClient(userId, input) {
        const user = await this.userRepo.findClientById(userId);
        if (!user) {
            throw new app_error_1.AppError("Client not found", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        if (input.email &&
            input.email !== user.email) {
            const existingUser = await this.userRepo.findByEmail(input.email);
            if (existingUser &&
                existingUser._id.toString() !== userId) {
                throw new app_error_1.AppError("A user with this email already exists", http_status_codes_1.StatusCodes.CONFLICT);
            }
        }
        const updatedUser = await this.userRepo.updateClient(userId, input);
        if (!updatedUser) {
            throw new app_error_1.AppError("Unable to update client", http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        }
        return this.toClientResponse(updatedUser);
    }
    toClientResponse(user) {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: "CLIENT",
            isActive: user.isActive,
            lastLogin: user.lastLogin ?? null,
            createdAt: user.createdAt ?? new Date(),
        };
    }
    async updateClientStatus(userId, input) {
        const client = await this.userRepo.findClientById(userId);
        if (!client) {
            throw new app_error_1.AppError("Client not found", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        const updatedClient = await this.userRepo.updateClientStatus(userId, input.isActive);
        if (!updatedClient) {
            throw new app_error_1.AppError("Unable to update client status", http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        }
        return this.toClientResponse(updatedClient);
    }
}
exports.userService = new UserService(user_repository_1.userRepository);
