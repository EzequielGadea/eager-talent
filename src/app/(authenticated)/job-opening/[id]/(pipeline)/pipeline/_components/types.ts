import type { JobOpeningStage } from "~/lib/interview-stages";

export type PipelineStage = JobOpeningStage;

export type PipelineCandidate = {
  applicantId: string;
  name: string;
  lastName: string;
  photo: string | null;
  role: string | null;
  nextInterview: { date: Date | string } | null;
};

export type PendingMove = {
  candidate: PipelineCandidate;
  fromStage: string;
  toStage: string;
};
