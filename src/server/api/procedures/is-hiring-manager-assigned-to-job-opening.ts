import type { Prisma } from "~/generated/prisma/client";

export function isHiringManagerAssignedToJobOpening(
  userId: string,
): Prisma.JobOpeningWhereInput {
  return {
    hiringManagers: {
      some: {
        id: userId,
      },
    },
  };
}