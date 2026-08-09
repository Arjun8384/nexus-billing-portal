import type {
  LoginInput,
  LoginResponse,
  User,
} from "@/types/auth";

import { apiFetch } from "@/lib/api";

export async function login(
  input: LoginInput
): Promise<User> {
  const response =
    await apiFetch<LoginResponse>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );

  return response.data.user;
}

export async function logout(): Promise<void> {
  await apiFetch(
    "/api/auth/logout",
    {
      method: "POST",
    }
  );
}