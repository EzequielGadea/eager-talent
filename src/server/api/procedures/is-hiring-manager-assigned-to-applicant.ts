import type { Prisma } from "~/generated/prisma/client";

export function isHiringManagerAssignedToApplicant(
  userId: string,
): Prisma.ApplicantWhereInput {
  return {
    OR: [
      {
        applicantHiringManagers: {
          some: {
            hiringManagerId: userId,
          },
        },
      },
      {
        applications: {
          some: {
            deletedAt: null,
            jobOpening: {
              hiringManagers: { some: { id: userId } },
            },
          },
        },
      },
    ],
  };
}
