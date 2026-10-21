import { z } from "zod";

import type { Prisma } from "~/generated/prisma/client";

export const jobOpeningSortSchema = z.enum([
  "newest",
  "oldest",
  "title-asc",
  "applicants-desc",
  "applicants-asc",
  "status",
]);

export type JobOpeningSortValue = z.infer<typeof jobOpeningSortSchema>;

export type ApplicantCountSortValue = Extract<
  JobOpeningSortValue,
  "applicants-desc" | "applicants-asc"
>;

type DatabaseJobOpeningSortValue = Exclude<
  JobOpeningSortValue,
  ApplicantCountSortValue
>;

export const defaultJobOpeningSort: JobOpeningSortValue = "newest";

export function getJobOpeningOrderBy(
  sort: DatabaseJobOpeningSortValue,
): Prisma.JobOpeningOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ openingDate: "asc" }, { id: "asc" }];

    case "title-asc":
      return [{ name: "asc" }, { id: "asc" }];

    case "status":
      return [{ status: "asc" }, { id: "asc" }];

    case "newest":
      return [{ openingDate: "desc" }, { id: "asc" }];
  }
}

export function isApplicantCountSort(
  sort: JobOpeningSortValue,
): sort is ApplicantCountSortValue {
  return sort === "applicants-desc" || sort === "applicants-asc";
}
