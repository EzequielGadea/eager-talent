import { headers } from "next/headers";
import { Suspense } from "react";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { api } from "~/lib/trpc/server";
import JobOpeningNotFound from "~/app/(authenticated)/job-openings/[id]/not-found";

import { JobOpeningHeader } from "../_components/job-opening-header";
import { JobOpeningLayoutSkeleton } from "../_components/job-opening-layout-skeleton";
import { JobOpeningTabs } from "../_components/job-opening-tabs";
import { Pipeline } from "./_components/pipeline";
import type { PipelineStage } from "./_components/types";

type PipelinePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string | string[] }>;
};

export default function PipelinePage({
  params,
  searchParams,
}: PipelinePageProps) {
  return (
    <Suspense fallback={<JobOpeningLayoutSkeleton />}>
      <PipelineContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function PipelineContent({ params, searchParams }: PipelinePageProps) {
  const { id } = await params;
  const { search: rawSearch } = await searchParams;
  const search = typeof rawSearch === "string" ? rawSearch : undefined;
  const requestHeaders = await headers();

  const [jobOpening, canCreateApplication, canUpdateJobOpening] =
    await Promise.all([
      api.jobOpening.fetchById({ id }).catch((error: unknown) => {
        if (
          error instanceof TRPCError &&
          (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")
        ) {
          return null;
        }
        throw error;
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: {
          permissions: {
            application: ["create"],
          },
        },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: {
          permissions: {
            jobOpening: ["update"],
          },
        },
      }),
    ]);

  if (!jobOpening) {
    return <JobOpeningNotFound />;
  }

  const stages = jobOpening.stages as PipelineStage[];

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 p-6">
      <JobOpeningHeader
        jobOpeningId={jobOpening.id}
        name={jobOpening.name}
        status={jobOpening.status}
        areaName={jobOpening.area.name}
        openingDate={jobOpening.openingDate}
        canCreateApplication={canCreateApplication.success}
        canUpdateJobOpening={canUpdateJobOpening.success}
      />

      <JobOpeningTabs jobOpeningId={jobOpening.id} />

      <Pipeline jobOpeningId={jobOpening.id} stages={stages} search={search} />
    </main>
  );
}
