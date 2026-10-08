export type DisqualifiedApplication = {
  applicantId: string;
  stage: string;
  disqualificationDate: Date;
  disqualificationReason: string | null;
  name: string;
  lastName: string;
  photo: string | null;
  role: string;
};
