import { headers } from "next/headers";
import { Suspense } from "react";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { api } from "~/lib/trpc/server";
import JobOpeningNotFound from "~/app/(authenticated)/job-openings/[id]/not-found";
import type { PipelineStage } from "~/app/(authenticated)/job-openings/[id]/(pipeline)/pipeline/_components/types";

import { JobOpeningHeader } from "../_components/job-opening-header";
import { JobOpeningLayoutSkeleton } from "../_components/job-opening-layout-skeleton";
import { JobOpeningTabs } from "../_components/job-opening-tabs";
import { DisqualifiedBoard } from "./_components/disqualified-board";

type DisqualifiedPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string | string[] }>;
};

export default function DisqualifiedPage({
  params,
  searchParams,
}: DisqualifiedPageProps) {
  return (
    <Suspense fallback={<JobOpeningLayoutSkeleton />}>
      <DisqualifiedContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function DisqualifiedContent({
  params,
  searchParams,
}: DisqualifiedPageProps) {
  const { id } = await params;
  const { search: rawSearch } = await searchParams;
  const search = typeof rawSearch === "string" ? rawSearch : undefined;

  const requestHeaders = await headers();

  const [
    jobOpening,
    applications,
    canCreateApplication,
    canUpdateJobOpening,
    canRequalify,
  ] = await Promise.all([
    api.jobOpening.fetchById({ id }).catch((error: unknown) => {
      if (
        error instanceof TRPCError &&
        (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")
      ) {
        return null;
      }
      throw error;
    }),
    api.jobOpening
      .fetchDisqualifiedApplications({ jobOpeningId: id, search })
      .catch((error: unknown) => {
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
      body: { permissions: { application: ["create"] } },
    }),
    auth.api.hasPermission({
      headers: requestHeaders,
      body: { permissions: { jobOpening: ["update"] } },
    }),
    auth.api.hasPermission({
      headers: requestHeaders,
      body: { permissions: { application: ["update"] } },
    }),
  ]);

  if (!jobOpening || !applications) {
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

      <DisqualifiedBoard
        jobOpeningId={id}
        stages={stages}
        applications={applications}
        canRequalify={canRequalify.success}
      />
    </main>
  );
}
