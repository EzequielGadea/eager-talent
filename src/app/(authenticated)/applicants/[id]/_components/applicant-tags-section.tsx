import type { Applicant } from "./applicant-details";
import { ApplicantTags } from "./applicant-tags";

type ApplicantTagsSectionProps = {
  applicantPromise: Promise<Applicant>;
};

export async function ApplicantTagsSection({
  applicantPromise,
}: ApplicantTagsSectionProps) {
  return <ApplicantTags applicantPromise={applicantPromise} />;
}
