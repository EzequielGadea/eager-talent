import type { Prisma } from "~/generated/prisma/client";

export function getApplicantByKeywordWhere(
  query?: string,
): Prisma.ApplicantWhereInput {
  if (!query) return {};

  const queryTerms = query.split(/\s+/).filter(Boolean);

  if (queryTerms.length === 0) return {};

  return {
    AND: queryTerms.map((term) => ({
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { role: { name: { contains: term, mode: "insensitive" } } },
        {
          tags: {
            some: {
              name: { contains: term, mode: "insensitive" },
            },
          },
        },
      ],
    })),
  };
}
