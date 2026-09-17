import { api } from "~/lib/trpc/server";
import { ApplicantsPromise } from "./types";
import { avatarPalette } from "./constants";

export async function getApplicantsPage(currentPage: number) {
  return api.applicant.fetchAll({ page: currentPage });
}

export async function transformApplicants(promise: ApplicantsPromise) {
  const data = await promise;
  const applicantsData = (data) ? data.applicants.map((applicant) => {
    console.log(applicant.name, applicant.linkedin)
    const jobOpenings = (applicant.applications) ? applicant.applications
      .filter((application) => (application.active))
      .map(
        application => {
          if (application.active) { return application.jobOpening.name }
        },
      ) : [];
    return {
      id: applicant.id,
      initials: applicant.name[0] + applicant.lastName[0],
      name: applicant.name + ' ' + applicant.lastName,
      avatarBg: getRandomColor(),
      tags: (applicant.tags) ? applicant.tags.map(
        (tag) => ({
          label: tag.name,
          color: tag.color,
        })
      ) : [],

      jobOpening: jobOpenings.length ? jobOpenings.join(", \r\n") : "-",

      role: (applicant.role?.name) ?? "-",
      seniorityName: (applicant.seniority?.name) ?? "-",
      seniorityColor: (applicant.seniority?.color) ?? "-",
      area: (applicant.area?.name) ?? "-",
      sourceText: (applicant.source) ?? "-",
      hasCv: applicant.resume != null,
      hasLinkedin: applicant.linkedin != null,
      linkedinUrl: applicant.linkedin ?? "-",
      email: applicant.email ?? "-",
    }
  }) : [];

  const countApplicants = applicantsData.length
  const uniqueOpenings = new Set<string>();
  for (const applicant of data.applicants) {
    for (const open of applicant.applications) {
      uniqueOpenings.add(open.jobOpening.name);
    }
  }
  const countOpenings = (uniqueOpenings.has("—")) ? uniqueOpenings.size - 1 : uniqueOpenings.size
  return { applicantsData, countApplicants, countOpenings };
}

export function getRandomColor() {
  const index = Math.floor(Math.random() * avatarPalette.length);
  return avatarPalette[index]
}
