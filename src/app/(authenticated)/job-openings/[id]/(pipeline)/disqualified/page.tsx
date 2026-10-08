import { Suspense } from "react";
import { api } from "~/lib/trpc/server";
import { PipelineSkeleton } from "~/app/(authenticated)/job-openings/[id]/(pipeline)/pipeline/_components/pipeline-skeleton";
import type { PipelineStage } from "~/app/(authenticated)/job-openings/[id]/(pipeline)/pipeline/_components/types";
import { DisqualifiedBoard } from "./_components/disqualified-board";

type DisqualifiedPageProps = {
  params: Promise<{ id: string }>;
};

export default function DisqualifiedPage({ params }: DisqualifiedPageProps) {
  return (
    // Mientras cargan los datos se muestra el mismo esqueleto del pipeline.
    <Suspense fallback={<PipelineSkeleton />}>
      <DisqualifiedContent params={params} />
    </Suspense>
  );
}

async function DisqualifiedContent({ params }: DisqualifiedPageProps) {
  const { id } = await params;

  const [jobOpening, applications] = await Promise.all([
    api.jobOpening.fetchById({ id }),
    api.jobOpening.fetchDisqualifiedApplications({ jobOpeningId: id }),
  ]);

  const stages = jobOpening.stages as PipelineStage[];
  return <DisqualifiedBoard stages={stages} applications={applications} />;
}
