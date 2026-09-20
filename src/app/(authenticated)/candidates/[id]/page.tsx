import { Suspense } from "react";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import Loading from "~/components/ui/loading";
import { api } from "~/lib/trpc/server";
import { CandidateOverviewCard } from "./_components/candidate-overview-card";
import { CandidateInfoCards } from "./_components/candidate-info-cards";
import { CandidateApplications } from "./_components/candidate-applications";
import { CandidateLogsSection } from "./_components/candidate-logs-section";
import { CandidateNotes } from "./_components/candidate-notes";
import { CandidateTags } from "./_components/candidate-tags";

type CandidatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function CandidatePage({ params }: CandidatePageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CandidatePageContent params={params} />
    </Suspense>
  );
}

async function CandidatePageContent({ params }: CandidatePageProps) {
  const { id } = await params;
  const candidatePromise = api.candidate
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
          <CandidateOverviewCard candidatePromise={candidatePromise} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <CandidateInfoCards candidatePromise={candidatePromise} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <CandidateApplications candidatePromise={candidatePromise} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <CandidateLogsSection candidatePromise={candidatePromise} />
        </Suspense>
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <Suspense fallback={<Loading />}>
          <CandidateNotes candidatePromise={candidatePromise} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <CandidateTags candidatePromise={candidatePromise} />
        </Suspense>
      </aside>
    </div>
  );
}
