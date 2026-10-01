import "server-only";
import { headers } from "next/headers";
import { Suspense } from "react";
import { z } from "zod";
import JobOpeningsFallback from "./_components/job-openings-fallback";
import { auth } from "~/lib/auth";
import JobOpeningsList from "./_components/job-opening-list";

const jobOpeningsSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export default function JobOpeningsPage(props: {
  searchParams?: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<JobOpeningsFallback />}>
      <JobOpeningsPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function JobOpeningsPageContent(props: {
  searchParams?: Promise<{ page?: string }>;
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

  return (
    <JobOpeningsList
      currentPage={params.page}
      isHiringManagerView={isHiringManagerView}
    />
  );
}
