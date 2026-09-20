import { api } from "~/lib/trpc/server";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

import { CandidateApplicationsCard } from "./candidate-applications-card";

type CandidateApplicationsProps = {
  candidatePromise: Promise<Awaited<ReturnType<typeof api.candidate.getById>>>;
};

export async function CandidateApplications({
  candidatePromise,
}: CandidateApplicationsProps) {
  const candidate = await candidatePromise;
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
    api.application.getAllByCandidateId({ candidateId: candidate.id }),
    api.interview.getAllByCandidateId({ candidateId: candidate.id }),
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
    <CandidateApplicationsCard
      applications={applicationsWithInterviews}
      canCreatePublicLink={canCreatePublicLink.success}
      canUpdateApplication={canUpdateApplication.success}
      canCreateInterview={canCreateInterview.success}
    />
  );
}
