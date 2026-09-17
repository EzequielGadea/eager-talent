import { api } from "~/lib/trpc/server";

export interface Tag {
  label: string;
  color: string;
}

export interface ApplicantInfo {
  id: string;
  initials: string;
  name: string;
  avatarBg: string;
  tags: Tag[];
  jobOpening: string;
  role: string;
  seniorityName: string | undefined//"Senior" | "Mid-Senior" | "Mid";
  seniorityColor: string;
  area: string;
  sourceText: string;
  hasCv: boolean;
  hasLinkedin: boolean;
  linkedinUrl: string;
  email: string;
}

export type ApplicantsPromise = ReturnType<typeof api.applicant.fetchAll>;

export interface FiltersProps {
  roleData: Awaited<ReturnType<typeof api.role.getAllRoles>>;
  seniorityData: Awaited<ReturnType<typeof api.seniority.getAllSeniorities>>;
  areaData: Awaited<ReturnType<typeof api.area.getAllAreas>>;
  jobOpeningData: Awaited<ReturnType<typeof api.jobOpening.getAllJobOpenings>>;
  tagData: Awaited<ReturnType<typeof api.tag.getAllTags>>;
}


