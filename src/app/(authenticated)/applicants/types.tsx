import { api } from "~/lib/trpc/server";
import { Globe, Send, Users, X } from "lucide-react";

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
  seniorityName: string | undefined; //"Senior" | "Mid-Senior" | "Mid";
  seniorityColor: string;
  area: string;
  sourceText: string;
  sourceIcon: React.ReactNode;
  hasCv: boolean;
  cvUrl: string;
  hasLinkedin: boolean;
  linkedinUrl: string;
  email: string;
}

export const ITEMS_PER_PAGE = 8;

export type ApplicantsPromise = ReturnType<typeof api.applicant.fetchAll>;

const avatarPalette = [
  "bg-dashboard-success-avatar text-dashboard-success-text",
  "bg-dashboard-purple-avatar text-dashboard-purple-text",
  "bg-dashboard-orange-light text-dashboard-orange-text",
  "bg-dashboard-sky-avatar text-dashboard-sky-text",
];

export function getRandomColor() {
  const index = Math.floor(Math.random() * avatarPalette.length);
  return avatarPalette[index];
}

function getSourceIcon(sourceText: string) {
  switch (sourceText) {
    case "Inbound":
      return <Globe size={14} className="text-dashboard-text-muted" />;
    case "Outbound":
      return <Send size={14} className="text-dashboard-text-muted" />;
    case "Referral":
      return <Users size={14} className="text-dashboard-text-muted" />;
    default:
      return <X size={14} className="text-dashboard-text-muted" />;
  }
}

export async function transformApplicants(promise: ApplicantsPromise) {
  const data = await promise;
  const applicantsData = data
    ? data.applicants.map((applicant) => {
        const jobOpenings = applicant.applications
          ? applicant.applications
              .filter((application) => application.active)
              .map((application) => {
                if (application.active) {
                  return application.jobOpening.name;
                }
              })
          : [];
        return {
          id: applicant.id,
          initials: applicant.name[0] + applicant.lastName[0],
          name: applicant.name + " " + applicant.lastName,
          avatarBg: getRandomColor(),
          tags: applicant.tags
            ? applicant.tags.map((tag) => ({
                label: tag.name,
                color: tag.color,
              }))
            : [],

          jobOpening: jobOpenings.length ? jobOpenings.join(", \r\n") : "-",

          role: applicant.role.name ?? "-",
          seniorityName: applicant.seniority?.name ?? "-",
          seniorityColor: applicant.seniority?.color ?? "-",
          area: applicant.area?.name ?? "-",
          sourceText: applicant.source ?? "Not found",
          sourceIcon: getSourceIcon(applicant.source ?? "null"),
          hasCv: applicant.resume != null,
          hasLinkedin: applicant.linkedin != null,
          cvUrl: applicant.resume ?? "-",
          linkedinUrl: applicant.linkedin ?? "-",
          email: applicant.email ?? "-",
        };
      })
    : [];

  const countApplicants = applicantsData.length;
  const uniqueOpenings = new Set<string>();
  for (const applicant of data.applicants) {
    for (const open of applicant.applications) {
      uniqueOpenings.add(open.jobOpening.name);
    }
  }
  const countOpenings = uniqueOpenings.has("—")
    ? uniqueOpenings.size - 1
    : uniqueOpenings.size;
  return { applicantsData, countApplicants, countOpenings };
}
