import "server-only";

import { randomBytes } from "node:crypto";
import { z } from "zod";

const PUBLIC_LINK_TOKEN_BYTES = 32;

// 32 random bytes encoded as base64url without padding are always 43 characters.
export const publicLinkTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, "Token inválido");

// Tokens are only generated here, on the server. Never accept a client token
// and never write the token to logs or Activity.
export function generatePublicLinkToken() {
  return randomBytes(PUBLIC_LINK_TOKEN_BYTES).toString("base64url");
}
