import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import type { api } from "~/lib/trpc/server";
import { ApplicantOverviewCard } from "./applicant-overview-card";

type ApplicantPromise = Promise<
  Awaited<ReturnType<typeof api.applicant.getById>>
>;

type ApplicantOverviewProps = {
  applicantPromise: ApplicantPromise;
};

export async function ApplicantOverview({
  applicantPromise,
}: ApplicantOverviewProps) {
  const applicant = await applicantPromise;
  const requestHeaders = await headers();

  const [canShareWithHiringManager, canUpdateApplicant, canDeleteApplicant] =
    await Promise.all([
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { user: ["update"] } },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { applicant: ["update"] } },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { applicant: ["delete"] } },
      }),
    ]);

  return (
    <ApplicantOverviewCard
      applicant={applicant}
      canShareWithHiringManager={canShareWithHiringManager.success}
      canUpdateApplicant={canUpdateApplicant.success}
      canDeleteApplicant={canDeleteApplicant.success}
    />
  );
}
