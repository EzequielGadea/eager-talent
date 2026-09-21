import { api } from "~/lib/trpc/server";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

import { ApplicantApplicationsCard } from "./applicant-applications-card";

type ApplicantApplicationsProps = {
  applicantPromise: Promise<Awaited<ReturnType<typeof api.applicant.getById>>>;
};

export async function ApplicantApplications({
  applicantPromise,
}: ApplicantApplicationsProps) {
  const applicant = await applicantPromise;
  const requestHeaders = await headers();
  const [canCreatePublicLink, canUpdateApplication, canCreateInterview] =
    await Promise.all([
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { publicLink: ["create"] } },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { application: ["update"] } },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { interview: ["create"] } },
      }),
    ]);

  const [applications, interviews] = await Promise.all([
    api.application.getAllByApplicantId({ applicantId: applicant.id }),
    api.interview.getAllByApplicantId({ applicantId: applicant.id }),
  ]);

  const applicationsWithInterviews = applications.map((application) => ({
    ...application,
    interviews: interviews.filter(
      (interview) =>
        interview.applicantId === application.applicantId &&
        interview.jobOpeningId === application.jobOpeningId,
    ),
  }));

  return (
    <ApplicantApplicationsCard
      applications={applicationsWithInterviews}
      canCreatePublicLink={canCreatePublicLink.success}
      canUpdateApplication={canUpdateApplication.success}
      canCreateInterview={canCreateInterview.success}
    />
  );
}
