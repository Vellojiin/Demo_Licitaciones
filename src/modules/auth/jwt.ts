import jwt from "jsonwebtoken";
import type { AuthSessionPayload } from "./application/use-cases/login.use-case";

const parsedTokenTtlHours = Number(process.env.JWT_EXPIRES_IN_HOURS);
const TOKEN_TTL_HOURS = Number.isFinite(parsedTokenTtlHours) && parsedTokenTtlHours > 0
    ? parsedTokenTtlHours : 8;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return secret;
}

export function signAuthToken(payload: AuthSessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: `${TOKEN_TTL_HOURS}h` });
}

export function verifyAuthToken(token: string): AuthSessionPayload {
  return jwt.verify(token, getJwtSecret()) as AuthSessionPayload;
}