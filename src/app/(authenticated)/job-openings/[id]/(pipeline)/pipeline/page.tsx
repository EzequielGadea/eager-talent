import { Suspense } from "react";

import { api } from "~/lib/trpc/server";

import { Pipeline } from "./_components/pipeline";
import { PipelineSkeleton } from "./_components/pipeline-skeleton";
import type { PipelineStage } from "./_components/types";

type PipelinePageProps = {
  params: Promise<{ id: string }>;
};

export default function PipelinePage({ params }: PipelinePageProps) {
  return (
    <Suspense fallback={<PipelineSkeleton />}>
      <PipelineContent params={params} />
    </Suspense>
  );
}

async function PipelineContent({ params }: PipelinePageProps) {
  const { id } = await params;

  const jobOpening = await api.jobOpening.fetchById({ id });
  const stages = jobOpening.stages as PipelineStage[];

  return <Pipeline jobOpeningId={jobOpening.id} stages={stages} />;
}
