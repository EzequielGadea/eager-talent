import "server-only";
import { headers } from "next/headers";
import { Suspense } from "react";
import { z } from "zod";
import { HiringManagerJobOpeningsFallback } from "./_components/hiring-manager-job-openings-fallback";
import { RecruiterJobOpeningsFallback } from "./_components/recruiter-job-openings-fallback";
import { auth } from "~/lib/auth";
import { Skeleton } from "~/components/ui/skeleton";
import JobOpeningsList from "./_components/job-opening-list";
import {
  defaultJobOpeningSort,
  jobOpeningSortSchema,
} from "~/server/api/routers/job-opening/sort";
import {
  jobOpeningAreaIdSchema,
  jobOpeningDateRangeSchema,
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
  openingDate: jobOpeningDateRangeSchema.optional().catch(undefined),
  withActiveCandidates: z.literal("true").optional().catch(undefined),
});

type JobOpeningsPageProps = {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    status?: string | string[];
    area?: string | string[];
    hiringManager?: string | string[];
    openingDate?: string | string[];
    withActiveCandidates?: string | string[];
  }>;
};

export default function JobOpeningsPage(props: JobOpeningsPageProps) {
  return (
    <Suspense fallback={<JobOpeningsRoleFallback />}>
      <JobOpeningsPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}

function JobOpeningsRoleFallback() {
  return (
    <div role="status" className="mx-auto flex w-full flex-col gap-5 p-6">
      <span className="sr-only">Cargando vacantes</span>
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-148 w-full rounded-xl" />
    </div>
  );
}

async function JobOpeningsPageContent(props: JobOpeningsPageProps) {
  const canReadAllResult = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        jobOpening: ["read"],
      },
    },
  });

  const isHiringManagerView = !canReadAllResult.success;

  return (
    <Suspense
      fallback={
        isHiringManagerView ? (
          <HiringManagerJobOpeningsFallback />
        ) : (
          <RecruiterJobOpeningsFallback />
        )
      }
    >
      <JobOpeningsListContent
        searchParams={props.searchParams}
        isHiringManagerView={isHiringManagerView}
      />
    </Suspense>
  );
}

async function JobOpeningsListContent(
  props: JobOpeningsPageProps & {
    isHiringManagerView: boolean;
  },
) {
  const rawParams = await (props.searchParams ?? Promise.resolve({}));

  const params = jobOpeningsSearchParamsSchema.parse(rawParams);

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
      currentOpeningDateRange={params.openingDate}
      currentOnlyWithActiveCandidates={Boolean(params.withActiveCandidates)}
      isHiringManagerView={props.isHiringManagerView}
    />
  );
}
