export const ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;

export type UserRole =
  (typeof ROLES)[keyof typeof ROLES];