import "server-only";
import { headers } from "next/headers";
import { Suspense } from "react";
import { z } from "zod";
import JobOpeningsFallback from "./_components/job-openings-fallback";
import { auth } from "~/lib/auth";
import JobOpeningsList from "./_components/job-opening-list";
import {
  defaultJobOpeningSort,
  jobOpeningSortSchema,
} from "~/server/api/routers/job-opening/sort";
import {
  jobOpeningAreaIdSchema,
  jobOpeningHiringManagerIdSchema,
  jobOpeningStatusSchema,
} from "~/server/api/routers/job-opening/filter";

const jobOpeningsSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  sort: jobOpeningSortSchema.catch(defaultJobOpeningSort),
  status: z
    .union([jobOpeningStatusSchema, z.array(jobOpeningStatusSchema)])
    .optional()
    .catch(undefined),
  area: jobOpeningAreaIdSchema.optional().catch(undefined),
  hiringManager: jobOpeningHiringManagerIdSchema.optional().catch(undefined),
});

export default function JobOpeningsPage(props: {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    status?: string | string[];
    area?: string | string[];
    hiringManager?: string | string[];
  }>;
}) {
  return (
    <Suspense fallback={<JobOpeningsFallback />}>
      <JobOpeningsPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function JobOpeningsPageContent(props: {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    status?: string | string[];
    area?: string | string[];
    hiringManager?: string | string[];
  }>;
}) {
  const rawParams = await (props.searchParams ?? Promise.resolve({}));

  const params = jobOpeningsSearchParamsSchema.parse(rawParams);

  const canReadAllResult = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        jobOpening: ["read"],
      },
    },
  });

  const isHiringManagerView = !canReadAllResult.success;
  const currentStatuses = params.status
    ? Array.isArray(params.status)
      ? params.status
      : [params.status]
    : [];

  return (
    <JobOpeningsList
      currentPage={params.page}
      currentSort={params.sort}
      currentStatuses={currentStatuses}
      currentAreaId={params.area}
      currentHiringManagerId={params.hiringManager}
      isHiringManagerView={isHiringManagerView}
    />
  );
}
