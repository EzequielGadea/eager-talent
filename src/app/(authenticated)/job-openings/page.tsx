import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { HiringManagerJobOpeningsFallback } from "./_components/hiring-manager-job-openings-fallback";
import { RecruiterJobOpeningsFallback } from "./_components/recruiter-job-openings-fallback";
import { auth } from "~/lib/auth";
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
import { Skeleton } from "~/components/ui/skeleton";

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
    notice?: string | string[];
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
    <div role="status" className="mx-auto flex w-full flex-col gap-5 md:p-6">
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
  const rawParams: Awaited<NonNullable<JobOpeningsPageProps["searchParams"]>> =
    await (props.searchParams ?? Promise.resolve({}));

  if (props.isHiringManagerView && rawParams.hiringManager !== undefined) {
    const cleanParams = new URLSearchParams();

    for (const [key, value] of Object.entries(rawParams)) {
      if (key === "hiringManager" || value === undefined) continue;
      for (const entry of Array.isArray(value) ? value : [value]) {
        cleanParams.append(key, entry);
      }
    }

    cleanParams.set("page", "1");
    cleanParams.set("notice", "hiring-manager-filter-unavailable");
    redirect(`/job-openings?${cleanParams.toString()}`);
  }

  const params = jobOpeningsSearchParamsSchema.parse(rawParams);

  const currentStatuses = params.status
    ? Array.isArray(params.status)
      ? params.status
      : [params.status]
    : [];

  return (
    <>
      {props.isHiringManagerView &&
        rawParams.notice === "hiring-manager-filter-unavailable" && (
          <p role="status" className="px-6 pt-6 text-sm text-text-secondary">
            Se quitó el filtro por Hiring Manager porque no está disponible para
            tu perfil.
          </p>
        )}
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
    </>
  );
}
