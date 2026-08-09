export type UserRole =
  | "ADMIN"
  | "CLIENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}