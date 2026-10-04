import { Prisma } from "~/generated/prisma/client";

export function getApplicantSearchWhere(
  search?: string,
): Prisma.ApplicantWhereInput {
  const terms = search?.trim().split(/\s+/).filter(Boolean);

  if (!terms?.length) {
    return {};
  }

  return {
    AND: terms.map((term) => ({
      OR: [
        {
          name: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          lastName: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    })),
  };
}