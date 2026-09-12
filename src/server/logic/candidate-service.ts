import { prisma } from "~/lib/prisma";

export async function getCandidateById(
  candidateId: string,
  currentUserId: string,
) {
  const currentUser = await prisma.user.findUnique({
    where: {
      id: currentUserId,
    },
    select: {
      role: true,
    },
  });

  if (!currentUser) {
    return null;
  }

  const candidate = await prisma.applicant.findFirst({
    where: {
      id: candidateId,
      ...(currentUser.role === "HiringManager"
        ? {
            hiringManagers: {
              some: {
                id: currentUserId,
              },
            },
          }
        : {}),
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

  if (!candidate) {
    return null;
  }

  return {
    ...candidate,
    permissions: {
      canEditProfile: currentUser.role === "Recruiter",
      readOnly: currentUser.role === "HiringManager",
    },
  };
}
