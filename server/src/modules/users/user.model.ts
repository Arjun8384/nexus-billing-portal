import {
  HydratedDocument,
  Model,
  Schema,
  model,
} from "mongoose";

import { ROLES } from "@/constants/roles";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export type User = {
  name: string;
  email: string;
  password: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  isActive: boolean;
  refreshToken?: string | null;
  lastLogin?: Date | null;
};

export type UserDocument =
  HydratedDocument<User>;

export const UserModel: Model<User> =
  model<User>("User", userSchema);