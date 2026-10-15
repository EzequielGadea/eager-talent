import { api } from "~/lib/trpc/server";
import { stageAllowsInterview } from "~/lib/validations/job-opening";

import { PipelineColumnClient } from "./pipeline-column-client";
import type { PipelineStage } from "./types";

type PipelineColumnProps = {
  jobOpeningId: string;
  stage: PipelineStage;
  isLastStage: boolean;
  search?: string;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
  canDeleteInterview: boolean;
};

export async function PipelineColumn({
  jobOpeningId,
  stage,
  isLastStage,
  search,
  canUpdateApplication,
  canCreateInterview,
  canDeleteInterview,
}: PipelineColumnProps) {
  const data = await api.jobOpening.fetchPipelineCandidates({
    jobOpeningId,
    stageId: stage.key,
    limit: 3,
    offset: 0,
    search,
  });

  const canScheduleInterviewInStage = stageAllowsInterview(stage);

  return (
    <section
      className="flex w-80 shrink-0 flex-col gap-3 border-t-4 pt-3"
      style={{ borderTopColor: stage.color }}
    >
      <PipelineColumnClient
        jobOpeningId={jobOpeningId}
        stageId={stage.key}
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
