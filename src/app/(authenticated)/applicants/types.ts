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

export interface Role {
  id: string;
  name: string;
}

export interface Seniority {
  id: string;
  name: string;
  color: string;
}

export interface Area {
  id: string;
  name: string;
}

export interface JobOpening {
  id: string;
  name: string;
}

export interface FiltersProps {
  applicants: ApplicantInfo[];
  roles: Role[];
  seniorities: Seniority[];
  areas: Area[];
  jobOpenings: JobOpening[];
  tags: Tag[];
}


