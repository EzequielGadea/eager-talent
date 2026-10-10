import type { Prisma } from "~/generated/prisma/client";
import { getPublicLinkStatus } from "~/server/public-link/validity";

export const publicLinkDtoSelect = {
  id: true,
  name: true,
  token: true,
  includeSalary: true,
  creationDate: true,
  expirationDate: true,
  revokedAt: true,
  createdBy: {
    select: {
      name: true,
      lastName: true,
    },
  },
} satisfies Prisma.PublicLinkSelect;

type PublicLinkRecord = Prisma.PublicLinkGetPayload<{
  select: typeof publicLinkDtoSelect;
}>;

// The token is only exposed while the link is active, so expired or revoked
// links can never be copied again.
export function toPublicLinkDto(link: PublicLinkRecord, now: Date) {
  const status = getPublicLinkStatus(link, now);

  return {
    id: link.id,
    name: link.name,
    includeSalary: link.includeSalary,
    creationDate: link.creationDate,
    expirationDate: link.expirationDate,
    revokedAt: link.revokedAt,
    createdByName: `${link.createdBy.name} ${link.createdBy.lastName}`.trim(),
    status,
    token: status === "active" ? link.token : null,
  };
}
