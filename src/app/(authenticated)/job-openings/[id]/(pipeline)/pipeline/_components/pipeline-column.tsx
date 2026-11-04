import { api } from "~/lib/trpc/server";
import { stageAllowsInterview } from "~/lib/validations/job-opening";

import { PipelineColumnClient } from "./pipeline-column-client";
import type { PipelineStage } from "./types";

type PipelineColumnProps = {
  jobOpeningId: string;
  jobOpeningName: string;
  stage: PipelineStage;
  isLastStage: boolean;
  search?: string;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
  canDeleteInterview: boolean;
};

export async function PipelineColumn({
  jobOpeningId,
  jobOpeningName,
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
      className="flex w-full shrink-0 flex-col gap-3 border-t-4 border-border-default pt-3 sm:w-80"
      style={{ borderTopColor: stage.color || undefined }}
    >
      <PipelineColumnClient
        jobOpeningId={jobOpeningId}
        jobOpeningName={jobOpeningName}
        stageId={stage.key}
        stageName={stage.name}
        initialCandidates={data.candidates}
        total={data.total}
        isLastStage={isLastStage}
        canUpdateApplication={canUpdateApplication}
        canCreateInterview={canCreateInterview && canScheduleInterviewInStage}
        canDeleteInterview={canDeleteInterview}
        search={search}
      />
    </section>
  );
}
