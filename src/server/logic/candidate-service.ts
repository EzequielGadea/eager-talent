import { prisma } from "~/lib/prisma";

export async function getCandidateById(candidateId: string) {
  const candidate = await prisma.applicant.findUnique({
    where: {
      id: candidateId,
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
      area: {
        select: {
          name: true,
        },
      },
      seniority: {
        select: {
          name: true,
          color: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          color: true,
          isSkill: true,
        },
      },
    },
  });

  return candidate;
}
