import type { api } from "~/lib/trpc/server";

import { CandidateOverviewCard } from "./candidate-overview-card";
import { CandidateInfoCards } from "./candidate-info-cards";

export type Candidate = Awaited<ReturnType<typeof api.candidate.getById>>;

type CandidateDetailsProps = {
  candidatePromise: Promise<Candidate>;
};

export async function CandidateDetails({
  candidatePromise,
}: CandidateDetailsProps) {
  return (
    <>
      <CandidateOverviewCard candidatePromise={candidatePromise} />

      <CandidateInfoCards candidatePromise={candidatePromise} />
    </>
  );
}
