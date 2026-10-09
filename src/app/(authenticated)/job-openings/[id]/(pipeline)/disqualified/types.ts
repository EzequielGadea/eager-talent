export type DisqualifiedApplication = {
  applicantId: string;
  stage: string;
  disqualificationDate: Date;
  disqualificationMotive: string | null;
  disqualificationDescription: string | null;
  name: string;
  lastName: string;
  photo: string | null;
  role: string;
};
