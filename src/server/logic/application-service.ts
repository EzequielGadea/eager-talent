import { prisma } from "~/lib/prisma";

export async function getApplicationsByCandidateId(candidateId: string) {
  return prisma.application.findMany({
    where: {
      applicantId: candidateId,
    },
    select: {
      jobOpeningId: true,
      applicationDate: true,
      active: true,
      currentStage: true,
      stageEntryDate: true,
      disqualificationDate: true,
      jobOpening: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      applicationDate: "desc",
    },
  });
}
