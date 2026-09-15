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
  seniorityName: string | undefined//"Senior" | "Mid-Senior" | "Mid";
  seniorityColor: string;
  area: string;
  sourceText: string;
  sourceIcon: React.ReactNode;
  hasCv: boolean;
  hasLinkedin: boolean;
  linkedinUrl: string;
  email: string;
}

export const ITEMS_PER_PAGE = 2;

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