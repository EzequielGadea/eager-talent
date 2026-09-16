import { api } from "~/lib/trpc/server";
import { avatarPalette } from "./constants";

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

export function getRandomColor() {
  const index = Math.floor(Math.random() * avatarPalette.length);
  return avatarPalette[index];
}
