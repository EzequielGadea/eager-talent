import { Suspense } from "react";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";
import { ApplicantInfoCards } from "./_components/applicant-info-cards";
import { ApplicantApplications } from "./_components/applicant-applications";
import { ApplicantLogsSection } from "./_components/applicant-logs-section";
import { ApplicantNotes } from "./_components/applicant-notes";
import { ApplicantTags } from "./_components/applicant-tags";
import { ApplicantOverview } from "./_components/applicant-overview";
import { ApplicantProfileSessionProvider } from "./_components/applicant-profile-session";
import {
  ApplicantApplicationsSkeleton,
  ApplicantInfoCardsSkeleton,
  ApplicantLogsSkeleton,
  ApplicantNotesSkeleton,
  ApplicantOverviewSkeleton,
  ApplicantPageSkeleton,
  ApplicantTagsSkeleton,
} from "./_components/applicant-page-skeleton";

type ApplicantPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ApplicantPage({ params }: ApplicantPageProps) {
  return (
    <Suspense fallback={<ApplicantPageSkeleton />}>
      <ApplicantPageContent params={params} />
    </Suspense>
  );
}

async function ApplicantPageContent({ params }: ApplicantPageProps) {
  const { id } = await params;
  const applicantPromise = api.applicant
    .getById({ id })
    .catch((error: unknown) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") {
        notFound();
      }
      throw error;
    });

  return (
    <ApplicantProfileSessionProvider key={id}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] selection:bg-tag-green-bg selection:text-tag-green-fg">
        <div className="flex min-w-0 flex-col gap-4">
          <Suspense fallback={<ApplicantOverviewSkeleton />}>
            <ApplicantOverview applicantPromise={applicantPromise} />
          </Suspense>

          <Suspense fallback={<ApplicantInfoCardsSkeleton />}>
            <ApplicantInfoCards applicantPromise={applicantPromise} />
          </Suspense>

          <Suspense fallback={<ApplicantApplicationsSkeleton />}>
            <ApplicantApplications applicantPromise={applicantPromise} />
          </Suspense>

          <Suspense fallback={<ApplicantLogsSkeleton />}>
            <ApplicantLogsSection applicantPromise={applicantPromise} />
          </Suspense>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <Suspense fallback={<ApplicantNotesSkeleton />}>
            <ApplicantNotes applicantPromise={applicantPromise} />
          </Suspense>

          <Suspense fallback={<ApplicantTagsSkeleton />}>
            <ApplicantTags applicantPromise={applicantPromise} />
          </Suspense>
        </aside>
      </div>
    </ApplicantProfileSessionProvider>
  );
}
