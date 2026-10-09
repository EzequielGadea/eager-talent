import { headers } from "next/headers";
import { Suspense } from "react";

import { auth } from "~/lib/auth";
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

  const requestHeaders = await headers();

  const [jobOpening, applications, canRequalify] = await Promise.all([
    api.jobOpening.fetchById({ id }),
    api.jobOpening.fetchDisqualifiedApplications({ jobOpeningId: id }),
    auth.api.hasPermission({
      headers: requestHeaders,
      body: { permissions: { application: ["update"] } },
    }),
  ]);

  const stages = jobOpening.stages as PipelineStage[];

  return (
    <DisqualifiedBoard
      jobOpeningId={id}
      stages={stages}
      applications={applications}
      canRequalify={canRequalify.success}
    />
  );
}
