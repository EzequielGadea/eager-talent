import { api } from "~/lib/trpc/server";
import { stageAllowsInterview } from "~/lib/interview-stages";

import { PipelineColumnClient } from "./pipeline-column-client";
import type { PipelineStage } from "./types";

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

  const canScheduleInterviewInStage = stageAllowsInterview(stage);

  return (
    <section
      className="flex w-80 shrink-0 flex-col gap-3 border-t-4 pt-3"
      style={{ borderTopColor: stage.color }}
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
