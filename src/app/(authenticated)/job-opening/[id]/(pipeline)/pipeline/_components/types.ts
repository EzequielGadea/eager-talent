export type PipelineStage = {
  key: string;
  name: string;
  type: string;
  label: string;
  color: string;
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
