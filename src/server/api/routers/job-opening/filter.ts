import { z } from "zod";

import type { Prisma } from "~/generated/prisma/client";
import { JobOpeningStatus } from "~/generated/prisma/enums";

export const jobOpeningStatusSchema = z.enum(JobOpeningStatus);
export const jobOpeningAreaIdSchema = z.string().min(1);
export const jobOpeningHiringManagerIdSchema = z.string().min(1);

export const jobOpeningFilterSchema = z.object({
  statuses: z.array(jobOpeningStatusSchema).default([]),
  areaId: jobOpeningAreaIdSchema.optional(),
  hiringManagerId: jobOpeningHiringManagerIdSchema.optional(),
});

export type JobOpeningFilterInput = z.infer<typeof jobOpeningFilterSchema>;

export function getJobOpeningFilterWhere(
  filters: JobOpeningFilterInput,
): Prisma.JobOpeningWhereInput {
  return {
    ...(filters.statuses.length > 0 && {
      status: {
        in: filters.statuses,
      },
    }),
    ...(filters.areaId && {
      areaId: filters.areaId,
    }),
    ...(filters.hiringManagerId && {
      hiringManagers: {
        some: {
          id: filters.hiringManagerId,
        },
      },
    }),
  };
}
