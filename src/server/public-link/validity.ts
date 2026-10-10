import type { Prisma } from "~/generated/prisma/client";

export type PublicLinkStatus = "active" | "expired" | "revoked";

type PublicLinkValidityFields = {
  revokedAt: Date | null;
  expirationDate: Date;
};

// Single source of truth for the link status:
// - revoked whenever revokedAt is set, even if it has also expired;
// - expired when expirationDate <= now;
// - active only when not revoked and expirationDate > now (strictly).
export function getPublicLinkStatus(
  link: PublicLinkValidityFields,
  now: Date = new Date(),
): PublicLinkStatus {
  if (link.revokedAt !== null) {
    return "revoked";
  }

  return link.expirationDate.getTime() > now.getTime() ? "active" : "expired";
}

export function isPublicLinkValid(
  link: PublicLinkValidityFields,
  now: Date = new Date(),
) {
  return getPublicLinkStatus(link, now) === "active";
}

// The same "active" rule expressed as a Prisma filter, so access checks can
// validate the link in the same query that reads it.
export function validPublicLinkWhere(
  now: Date = new Date(),
): Prisma.PublicLinkWhereInput {
  return {
    revokedAt: null,
    expirationDate: { gt: now },
  };
}
