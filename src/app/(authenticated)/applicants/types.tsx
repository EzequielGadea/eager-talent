import { api } from "~/lib/trpc/server";
import { avatarPalette } from "./constants";

export type FilterKey =
  "role" | "seniority" | "area" | "jobOpening" | "tag" | "source";

export type ApplicantsSearchParams = {
  search?: string | string[];
  page?: string | string[];
  role?: string | string[];
  jobOpening?: string | string[];
  seniority?: string | string[];
  tag?: string | string[];
  area?: string | string[];
  source?: string | string[];
};

interface Tag {
  label: string;
  color: string;
}

export interface ApplicantInfo {
  id: string;
  initials: string;
  name: string;
  avatarBg: string;
  photo: string | null;
  tags: Tag[];
  jobOpening: string[];
  role: string;
  seniorityName: string | undefined; //"Senior" | "Mid-Senior" | "Mid";
  seniorityColor: string;
  area: string;
  sourceText: string;
  hasCv: boolean;
  cvUrl: string;
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

export function getRandomColor() {
  const index = Math.floor(Math.random() * avatarPalette.length);
  return avatarPalette[index];
}
