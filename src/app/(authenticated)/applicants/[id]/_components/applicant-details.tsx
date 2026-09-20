import type { api } from "~/lib/trpc/server";

import { ApplicantInfoCards } from "./applicant-info-cards";
import { ApplicantOverview } from "./applicant-overview";

export type Applicant = Awaited<ReturnType<typeof api.applicant.getById>>;

type ApplicantDetailsProps = {
  applicantPromise: Promise<Applicant>;
};

export async function ApplicantDetails({
  applicantPromise,
}: ApplicantDetailsProps) {
  return (
    <>
      <ApplicantOverview applicantPromise={applicantPromise} />

      <ApplicantInfoCards applicantPromise={applicantPromise} />
    </>
  );
}
