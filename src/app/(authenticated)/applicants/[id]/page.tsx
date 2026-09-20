import { Suspense } from "react";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import Loading from "~/components/ui/loading";
import { api } from "~/lib/trpc/server";
import { ApplicantOverviewCard } from "./_components/applicant-overview-card";
import { ApplicantInfoCards } from "./_components/applicant-info-cards";
import { ApplicantApplications } from "./_components/applicant-applications";
import { ApplicantLogsSection } from "./_components/applicant-logs-section";
import { ApplicantNotes } from "./_components/applicant-notes";
import { ApplicantTags } from "./_components/applicant-tags";

type ApplicantPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ApplicantPage({ params }: ApplicantPageProps) {
  return (
    <Suspense fallback={<Loading />}>
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
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] selection:bg-tag-green-bg selection:text-tag-green-fg">
      <div className="flex min-w-0 flex-col gap-4">
        <Suspense fallback={<Loading />}>
          <ApplicantOverviewCard applicantPromise={applicantPromise} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <ApplicantInfoCards applicantPromise={applicantPromise} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <ApplicantApplications applicantPromise={applicantPromise} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <ApplicantLogsSection applicantPromise={applicantPromise} />
        </Suspense>
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <Suspense fallback={<Loading />}>
          <ApplicantNotes applicantPromise={applicantPromise} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <ApplicantTags applicantPromise={applicantPromise} />
        </Suspense>
      </aside>
    </div>
  );
}
