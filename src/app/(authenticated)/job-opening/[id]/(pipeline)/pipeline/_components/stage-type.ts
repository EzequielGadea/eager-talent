import type { PipelineStage } from "./types";
import { INTERVIEW_STAGE_TYPES } from "~/lib/interview-stages";

export function stageAllowsInterview(stage: PipelineStage) {
  return INTERVIEW_STAGE_TYPES.includes(stage.name);
}

/* 
import type { PipelineStage } from "./types";
import { stageAllowsInterview as checkStageAllowsInterview } from "~/lib/interview-stages";

export function stageAllowsInterview(stage: PipelineStage) {
  return checkStageAllowsInterview(stage.type);
}
*/
