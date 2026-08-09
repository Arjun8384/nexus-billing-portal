import type { JWTPayload } from "jose";
import type { UserRole } from "@/constants/roles";

export type TokenType = "access" | "refresh";

export interface JwtPayload extends JWTPayload {
  userId: string;
  role: UserRole;
  type: TokenType;
}