import { api } from "~/lib/trpc/server";

export type TagType = "purple" | "blue" | "green" | "orange";

interface Tag {
  label: string;
  type: TagType;
}

export interface ApplicantInfo {
  id: string;
  initials: string;
  name: string;
  avatarBg: string;
  tags: Tag[];
  jobOpening: string;
  role: string;
  seniority: string | undefined//"Senior" | "Mid-Senior" | "Mid";
  area: string;
  sourceText: string;
  sourceIcon: React.ReactNode;
  hasCv: boolean;
  hasLinkedin: boolean;
  linkedinUrl: string;
  email: string;
}

export const getTagClasses = (type: TagType) => {
  switch (type) {
    case "purple":
      return "bg-dashboard-purple-avatar text-dashboard-purple-text";
    case "blue":
      return "bg-dashboard-sky-avatar text-dashboard-sky-text";
    case "green":
      return "bg-dashboard-success-avatar text-dashboard-success-text";
    case "orange":
      return "bg-dashboard-orange-light text-dashboard-orange-text";
    default:
      return "bg-dashboard-track text-dashboard-text-muted";
  }
};

export const getSeniorityClasses = (seniority: ApplicantInfo["seniority"]) => {
  switch (seniority) {
    case "Senior":
      return "bg-dashboard-success-light text-dashboard-success-text";
    case "Mid-Senior":
      return "bg-dashboard-orange-light text-dashboard-orange-text";
    case "Mid":
      return "bg-dashboard-sky-avatar text-dashboard-sky-text";
    default:
      return "bg-dashboard-track text-dashboard-text-muted";
  }
};

export type ApplicantsPromise = ReturnType<typeof api.applicant.fetchAll>;

export const avatarPalette = [
  "bg-dashboard-success-avatar text-dashboard-success-text",
  "bg-dashboard-purple-avatar text-dashboard-purple-text",
  "bg-dashboard-orange-light text-dashboard-orange-text",
  "bg-dashboard-slate-avatar text-dashboard-slate-text",
  "bg-dashboard-sky-avatar text-dashboard-sky-text",
];