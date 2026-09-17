import { api } from "~/lib/trpc/server";

import { CandidateApplicationsCard } from "./candidate-applications-card";

type CandidateApplicationsProps = {
  candidatePromise: Promise<Awaited<ReturnType<typeof api.candidate.getById>>>;
};

export async function CandidateApplications({
  candidatePromise,
}: CandidateApplicationsProps) {
  const candidate = await candidatePromise;
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
    <CandidateApplicationsCard applications={applicationsWithInterviews} />
  );
}
