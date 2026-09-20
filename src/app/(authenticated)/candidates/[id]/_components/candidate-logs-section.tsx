import type { api } from "~/lib/trpc/server";
import { CandidateLogs } from "./candidate-logs";

type CandidatePromise = Promise<
  Awaited<ReturnType<typeof api.candidate.getById>>
>;
type CandidateLogsSectionProps = {
  candidatePromise: CandidatePromise;
};

export async function CandidateLogsSection({
  candidatePromise,
}: CandidateLogsSectionProps) {
  const candidate = await candidatePromise;
  return <CandidateLogs candidateId={candidate.id} />;
}
