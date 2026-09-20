import type { api } from "~/lib/trpc/server";

import { ApplicantOverviewCard } from "./applicant-overview-card";
import { ApplicantInfoCards } from "./applicant-info-cards";

export type Applicant = Awaited<ReturnType<typeof api.applicant.getById>>;

type ApplicantDetailsProps = {
  applicantPromise: Promise<Applicant>;
};

export async function ApplicantDetails({
  applicantPromise,
}: ApplicantDetailsProps) {
  return (
    <>
      <ApplicantOverviewCard applicantPromise={applicantPromise} />

      <ApplicantInfoCards applicantPromise={applicantPromise} />
    </>
  );
}
