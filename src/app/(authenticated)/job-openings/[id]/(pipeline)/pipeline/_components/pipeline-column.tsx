import { api } from "~/lib/trpc/server";
import { stageAllowsInterview } from "~/lib/interview-stages";

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
  const hash = stageName
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return stageColors[hash % stageColors.length];
}

type PipelineColumnProps = {
  jobOpeningId: string;
  stage: PipelineStage;
  isLastStage: boolean;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
  canDeleteInterview: boolean;
};

export async function PipelineColumn({
  jobOpeningId,
  stage,
  isLastStage,
  canUpdateApplication,
  canCreateInterview,
  canDeleteInterview,
}: PipelineColumnProps) {
  const data = await api.jobOpening.fetchPipelineCandidates({
    jobOpeningId,
    stageName: stage.name,
    limit: 3,
    offset: 0,
  });

  const stageColor = getStageColor(stage.name);
  const canScheduleInterviewInStage = stageAllowsInterview(stage);

  return (
    <section
      className={`flex w-80 shrink-0 flex-col gap-3 border-t-4 pt-3 ${stageColor}`}
    >
      <PipelineColumnClient
        jobOpeningId={jobOpeningId}
        stageName={stage.name}
        initialCandidates={data.candidates}
        total={data.total}
        isLastStage={isLastStage}
        canUpdateApplication={canUpdateApplication}
        canCreateInterview={canCreateInterview && canScheduleInterviewInStage}
        canDeleteInterview={canDeleteInterview}
      />
    </section>
  );
}
