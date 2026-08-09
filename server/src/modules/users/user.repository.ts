import {
  UserModel,
  type User,
  type UserDocument,
} from "./user.model";

import type { UpdateClientInput } from "./user.schema";

export class UserRepository {
  async findById(
    userId: string
  ): Promise<UserDocument | null> {
    return UserModel.findById(userId).select(
      "+refreshToken"
    );
  }

  async findByEmail(
    email: string
  ): Promise<UserDocument | null> {
    return UserModel.findOne({
      email: email.toLowerCase(),
    }).select("+password");
  }

  async findClients(): Promise<UserDocument[]> {
    return UserModel.find({
      role: "CLIENT",
    }).sort({
      createdAt: -1,
    });
  }

  async findClientById(
    userId: string
  ): Promise<UserDocument | null> {
    return UserModel.findOne({
      _id: userId,
      role: "CLIENT",
    });
  }

  async updateClient(
    userId: string,
    input: UpdateClientInput
  ): Promise<UserDocument | null> {
    return UserModel.findOneAndUpdate(
      {
        _id: userId,
        role: "CLIENT",
      },
      {
        $set: input,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async updateLastLogin(
    userId: string
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        lastLogin: new Date(),
      },
      {
        new: true,
      }
    );
  }

  async create(
    user: User
  ): Promise<UserDocument> {
    return UserModel.create(user);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        refreshToken,
      },
      {
        new: true,
      }
    );
  }

  async updateClientStatus(
  userId: string,
  isActive: boolean
): Promise<UserDocument | null> {
  return UserModel.findOneAndUpdate(
    {
      _id: userId,
      role: "CLIENT",
    },
    {
      $set: {
        isActive,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
}
}


export const userRepository =
  new UserRepository();