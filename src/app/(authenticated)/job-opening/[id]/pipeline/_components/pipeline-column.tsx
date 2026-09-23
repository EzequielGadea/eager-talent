import { api } from "~/lib/trpc/server";

import { PipelineColumnClient } from "./pipeline-column-client";
import type { PipelineStage } from "./types";

const stageColors = [
  "border-dashboard-sky-text",
  "border-dashboard-purple-text",
  "border-dashboard-orange-text",
  "border-dashboard-success-text",
  "border-tag-gray-fg",
  "border-tag-blue-fg",
  "border-tag-amber-fg",
];

function getStageColor(stageName: string) {
  const hash = stageName.split("").reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return stageColors[hash % stageColors.length];
}

type PipelineColumnProps = {
  jobOpeningId: string;
  stage: PipelineStage;
};

export async function PipelineColumn({
  jobOpeningId,
  stage,
}: PipelineColumnProps) {
  const data = await api.jobOpening.fetchPipelineCandidates({
    jobOpeningId,
    stageName: stage.name,
    limit: 3,
    offset: 0,
  });

  const stageColor = getStageColor(stage.name);

  return (
    <section
      className={`flex w-80 shrink-0 flex-col gap-3 border-t-4 pt-3 ${stageColor}`}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text-primary">
            {stage.name}
          </h2>

          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {data.total}
          </span>
        </div>
      </header>

      <PipelineColumnClient
        jobOpeningId={jobOpeningId}
        stageName={stage.name}
        initialCandidates={data.candidates}
        total={data.total}
      />
    </section>
  );
}