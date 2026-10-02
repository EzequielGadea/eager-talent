import { z } from "zod";
import { subDays } from "date-fns";

import type { Prisma } from "~/generated/prisma/client";
import { JobOpeningStatus } from "~/generated/prisma/enums";

export const jobOpeningStatusSchema = z.enum(JobOpeningStatus);
export const jobOpeningAreaIdSchema = z.string().min(1);
export const jobOpeningHiringManagerIdSchema = z.string().min(1);
export const jobOpeningDateRangeSchema = z.enum(["7", "30", "90"]);

export const jobOpeningFilterSchema = z.object({
  statuses: z.array(jobOpeningStatusSchema).default([]),
  areaId: jobOpeningAreaIdSchema.optional(),
  hiringManagerId: jobOpeningHiringManagerIdSchema.optional(),
  openingDateRange: jobOpeningDateRangeSchema.optional(),
  onlyWithActiveCandidates: z.boolean().default(false),
});

export type JobOpeningFilterInput = z.infer<typeof jobOpeningFilterSchema>;

export function getJobOpeningFilterWhere(
  filters: JobOpeningFilterInput,
): Prisma.JobOpeningWhereInput {
  const now = new Date();

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
    ...(filters.openingDateRange && {
      openingDate: {
        gte: subDays(now, Number(filters.openingDateRange)),
        lte: now,
      },
    }),
    ...(filters.onlyWithActiveCandidates && {
      applications: {
        some: {
          active: true,
        },
      },
    }),
  };
}
