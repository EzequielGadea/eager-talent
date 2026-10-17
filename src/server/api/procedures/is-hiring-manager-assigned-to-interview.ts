import type { Prisma } from "~/generated/prisma/client";

export function isHiringManagerAssignedToInterview(
  userId: string,
): Prisma.InterviewWhereInput {
  return {
    assignments: {
      some: {
        interviewerId: userId,
      },
    },
  };
}
