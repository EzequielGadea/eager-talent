import { prisma } from "~/lib/prisma";

export async function getActivitiesByCandidateId(candidateId: string) {
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where: {
        applicantId: candidateId,
      },
      select: {
        id: true,
        description: true,
        date: true,
        jobOpeningId: true,
        application: {
          select: {
            jobOpening: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 6,
    }),

    prisma.activity.count({
      where: {
        applicantId: candidateId,
      },
    }),
  ]);

  return {
    activities,
    total,
  };
}
