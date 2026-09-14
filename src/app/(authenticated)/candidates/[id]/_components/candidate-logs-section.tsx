import type { Candidate } from "./candidate-details";
import { CandidateLogs } from "./candidate-logs";

type CandidateLogsSectionProps = {
  candidatePromise: Promise<Candidate>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function CandidateLogsSection({
  candidatePromise,
  searchParams,
}: CandidateLogsSectionProps) {
  const candidate = await candidatePromise;

  if (!candidate.permissions.canViewLogs) return null;

  return (
    <CandidateLogs candidateId={candidate.id} searchParams={searchParams} />
  );
}
