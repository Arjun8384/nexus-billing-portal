import { SignJWT, jwtVerify } from "jose";

import { env } from "@/config/env";
import type { JwtPayload } from "@/types/auth";

const secret = new TextEncoder().encode(
  env.JWT_SECRET
);

export async function generateToken(
  payload: JwtPayload
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<JwtPayload> {
  const { payload } = await jwtVerify(
    token,
    secret
  );

  return payload as unknown as JwtPayload;
}