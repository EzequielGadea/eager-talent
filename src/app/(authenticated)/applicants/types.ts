import { api } from "~/lib/trpc/server";

interface Tag {
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
  seniorityName: string;
  seniorityColor: string;
  area: string;
  sourceText: string;
  sourceIcon: React.ReactNode;
  hasCv: boolean;
  hasLinkedin: boolean;
  linkedinUrl: string;
  email: string;
}

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

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface FiltersProps {
  applicants: ApplicantInfo[];
  roles: Role[];
  seniorities: Seniority[];
  areas: Area[];
  jobOpenings: JobOpening[];
  tags: Tag[];
}

export type ApplicantsPromise = ReturnType<typeof api.applicant.fetchAll>;

const avatarPalette = [
  "bg-dashboard-success-avatar text-dashboard-success-text",
  "bg-dashboard-purple-avatar text-dashboard-purple-text",
  "bg-dashboard-orange-light text-dashboard-orange-text",
  "bg-dashboard-sky-avatar text-dashboard-sky-text",
];

export function getRandomColor() {
  const index = Math.floor(Math.random() * avatarPalette.length);
  return avatarPalette[index]
}