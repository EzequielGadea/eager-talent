import { Suspense } from "react";

import Loading from "~/components/ui/loading";
import { CandidateOverviewCard } from "./_components/candidate-overview-card";
import { CandidateInfoCards } from "./_components/candidate-info-cards";
import { CandidateLogs } from "./_components/candidate-logs";
import { CandidateTags } from "./_components/candidate-tags";

type CandidatePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function CandidatePage({
  params,
  searchParams,
}: CandidatePageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CandidatePageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CandidatePageContent({
  params,
  searchParams,
}: CandidatePageProps) {
  const { id } = await params;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <Suspense fallback={<Loading />}>
          <CandidateOverviewCard candidateId={id} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <CandidateInfoCards candidateId={id} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <CandidateLogs candidateId={id} searchParams={searchParams} />
        </Suspense>
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        {/* Candidate notes will be integrated here in a separate task. */}
        <Suspense fallback={<Loading />}>
          <CandidateTags candidateId={id} />
        </Suspense>
      </aside>
    </div>
  );
}
