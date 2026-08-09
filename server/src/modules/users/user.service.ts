import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";

import { ROLES } from "@/constants/roles";
import { AppError } from "@/utils/app-error";

import {
  UserRepository,
  userRepository,
} from "./user.repository";

import type {
  CreateClientInput,
  UpdateClientInput,
  UpdateClientStatusInput,
} from "./user.schema";

interface ClientResponse {
  id: string;
  name: string;
  email: string;
  role: "CLIENT";
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

class UserService {
  constructor(
    private readonly userRepo: UserRepository
  ) {}

  async createClient(
    input: CreateClientInput
  ): Promise<ClientResponse> {
    const existingUser =
      await this.userRepo.findByEmail(
        input.email
      );

    if (existingUser) {
      throw new AppError(
        "A user with this email already exists",
        StatusCodes.CONFLICT
      );
    }

    const hashedPassword =
      await bcrypt.hash(input.password, 12);

    const user =
      await this.userRepo.create({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: ROLES.CLIENT,
        isActive: true,
        refreshToken: null,
        lastLogin: null,
      });

    return this.toClientResponse(user);
  }

  async getClients(): Promise<ClientResponse[]> {
    const users =
      await this.userRepo.findClients();

    return users.map((user) =>
      this.toClientResponse(user)
    );
  }

  async getClientById(
    userId: string
  ): Promise<ClientResponse> {
    const user =
      await this.userRepo.findClientById(
        userId
      );

    if (!user) {
      throw new AppError(
        "Client not found",
        StatusCodes.NOT_FOUND
      );
    }

    return this.toClientResponse(user);
  }

  async updateClient(
    userId: string,
    input: UpdateClientInput
  ): Promise<ClientResponse> {
    const user =
      await this.userRepo.findClientById(
        userId
      );

    if (!user) {
      throw new AppError(
        "Client not found",
        StatusCodes.NOT_FOUND
      );
    }

    if (
      input.email &&
      input.email !== user.email
    ) {
      const existingUser =
        await this.userRepo.findByEmail(
          input.email
        );

      if (
        existingUser &&
        existingUser._id.toString() !== userId
      ) {
        throw new AppError(
          "A user with this email already exists",
          StatusCodes.CONFLICT
        );
      }
    }

    const updatedUser =
      await this.userRepo.updateClient(
        userId,
        input
      );

    if (!updatedUser) {
      throw new AppError(
        "Unable to update client",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return this.toClientResponse(updatedUser);
  }

  private toClientResponse(
    user: {
      _id: { toString(): string };
      name: string;
      email: string;
      role: string;
      isActive: boolean;
      lastLogin?: Date | null;
      createdAt?: Date;
    }
  ): ClientResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: "CLIENT",
      isActive: user.isActive,
      lastLogin: user.lastLogin ?? null,
      createdAt:
        user.createdAt ?? new Date(),
    };
  }

  async updateClientStatus(
  userId: string,
  input: UpdateClientStatusInput
): Promise<ClientResponse> {
  const client =
    await this.userRepo.findClientById(userId);

  if (!client) {
    throw new AppError(
      "Client not found",
      StatusCodes.NOT_FOUND
    );
  }

  const updatedClient =
    await this.userRepo.updateClientStatus(
      userId,
      input.isActive
    );

  if (!updatedClient) {
    throw new AppError(
      "Unable to update client status",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return this.toClientResponse(
    updatedClient
  );
}
}

export const userService =
  new UserService(userRepository);