import type { api } from "~/lib/trpc/server";
import { ApplicantLogs } from "./applicant-logs";

type ApplicantPromise = Promise<
  Awaited<ReturnType<typeof api.applicant.getById>>
>;
type ApplicantLogsSectionProps = {
  applicantPromise: ApplicantPromise;
};

export async function ApplicantLogsSection({
  applicantPromise,
}: ApplicantLogsSectionProps) {
  const applicant = await applicantPromise;
  return <ApplicantLogs applicantId={applicant.id} />;
}
