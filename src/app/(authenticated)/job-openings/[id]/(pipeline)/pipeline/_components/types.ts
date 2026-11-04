import type { InterviewType } from "~/generated/prisma/enums";
import type { PersistedStage } from "~/lib/validations/job-opening";

export type PipelineStage = PersistedStage;

export type PipelineCandidate = {
  applicantId: string;
  name: string;
  lastName: string;
  photo: string | null;
  role: string | null;
  nextInterview: { date: Date | string } | null;
  scheduledInterviews: {
    id: string;
    name: string;
    modality: InterviewType;
    duration: number;
    date: Date | string;
    interviewers: { id: string; name: string; lastName: string }[];
  }[];
};

export type PendingMove = {
  candidate: PipelineCandidate;
  fromStageId: string;
  toStageId: string;
};
