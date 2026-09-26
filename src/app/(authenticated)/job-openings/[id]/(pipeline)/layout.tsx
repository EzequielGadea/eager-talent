import { headers } from "next/headers";
import { Suspense } from "react";

import { api } from "~/lib/trpc/server";
import { auth } from "~/lib/auth";

import { JobOpeningHeader } from "./_components/job-opening-header";
import { JobOpeningLayoutSkeleton } from "./_components/job-opening-layout-skeleton";
import { JobOpeningTabs } from "./_components/job-opening-tabs";

type JobOpeningLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default function JobOpeningLayout({
  children,
  params,
}: JobOpeningLayoutProps) {
  return (
    <Suspense fallback={<JobOpeningLayoutSkeleton />}>
      <JobOpeningLayoutContent params={params}>
        {children}
      </JobOpeningLayoutContent>
    </Suspense>
  );
}

async function JobOpeningLayoutContent({
  children,
  params,
}: JobOpeningLayoutProps) {
  const { id } = await params;
  const requestHeaders = await headers();

  const [jobOpening, canCreateApplication, canUpdateJobOpening] =
    await Promise.all([
      api.jobOpening.fetchById({ id }),
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

      {children}
    </main>
  );
}
