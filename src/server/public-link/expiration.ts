import { z } from "zod";

// Not server-only: the client form reuses this schema to stay in sync with the
// server. The expiration date itself is always computed on the server.
export const PUBLIC_LINK_EXPIRATION_DAYS = [7, 30, 90] as const;

export type PublicLinkExpirationDays =
  (typeof PUBLIC_LINK_EXPIRATION_DAYS)[number];

export const publicLinkExpirationDaysSchema = z.literal(
  PUBLIC_LINK_EXPIRATION_DAYS,
  { error: "Elegí un plazo de vencimiento válido." },
);

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Fixed 24-hour days on the absolute timestamp, so the result does not depend
// on the time zone or DST rules of the machine running it.
export function getPublicLinkExpirationDate(
  days: PublicLinkExpirationDays,
  now: Date = new Date(),
) {
  return new Date(now.getTime() + days * DAY_IN_MS);
}
