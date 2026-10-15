import { Suspense } from "react";

import { api } from "~/lib/trpc/server";

import { Pipeline } from "./_components/pipeline";
import { PipelineSkeleton } from "./_components/pipeline-skeleton";
import type { PipelineStage } from "./_components/types";

type PipelinePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string }>;
};

export default function PipelinePage({ params, searchParams }: PipelinePageProps) {
  return (
    <Suspense fallback={<PipelineSkeleton />}>
      <PipelineContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function PipelineContent({ params, searchParams }: PipelinePageProps) {
  const { id } = await params;
  const { search } = await searchParams;

  const jobOpening = await api.jobOpening.fetchById({ id });
  const stages = jobOpening.stages as PipelineStage[];

  return <Pipeline jobOpeningId={jobOpening.id} stages={stages} search={search} />;
}
