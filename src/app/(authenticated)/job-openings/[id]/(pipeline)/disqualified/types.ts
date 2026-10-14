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

export const DISQUALIFIED_PAGE_SIZE = 3;
export const DEFAULT_STAGE_COLOR = "var(--muted-foreground)"; // default color if its undefined
