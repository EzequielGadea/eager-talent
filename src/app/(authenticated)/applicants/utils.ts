import { getSourceIcon } from "./_components/source-icon";
import { ApplicantsPromise } from "./types";
import { avatarPalette } from "./constants";

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
          initials:
            applicant.name && applicant.lastName
              ? applicant.name[0] + applicant.lastName[0]
              : "-",
          name:
            applicant.name || applicant.lastName
              ? `${applicant.name ?? ""} ${applicant.lastName ?? ""}`.trim()
              : "-",
          avatarBg: getRandomColor(),
          photo: applicant.photo ?? null,
          tags: applicant.tags
            ? applicant.tags.map((tag) => ({
                label: tag.name || "-",
                color: tag.color || "-",
              }))
            : [],

          jobOpening:
            jobOpenings.length > 0
              ? jobOpenings.filter(
                  (opening): opening is string => opening !== undefined,
                )
              : ["-"],

          role: applicant.role.name || "-",
          seniorityName: applicant.seniority?.name || "-",
          seniorityColor: applicant.seniority?.color || "-",
          area: applicant.area?.name || "-",
          sourceText: applicant.source || "-",
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

export function getRandomColor() {
  const index = Math.floor(Math.random() * avatarPalette.length);
  return avatarPalette[index];
}
