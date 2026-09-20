import type { Prisma } from "~/generated/prisma/client";

export function isHiringManagerAssignedToCandidate(
  userId: string,
): Prisma.ApplicantWhereInput {
  return {
    OR: [
      { hiringManagers: { some: { id: userId } } },
      {
        applications: {
          some: {
            jobOpening: {
              hiringManagers: { some: { id: userId } },
            },
          },
        },
      },
    ],
  };
}
