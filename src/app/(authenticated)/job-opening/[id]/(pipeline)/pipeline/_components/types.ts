export type PipelineStage = {
  name: string;
};

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
