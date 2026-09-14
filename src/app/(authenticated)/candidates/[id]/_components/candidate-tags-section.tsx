import type { Candidate } from "./candidate-details";
import { CandidateTags } from "./candidate-tags";

type CandidateTagsSectionProps = {
  candidatePromise: Promise<Candidate>;
};

export async function CandidateTagsSection({
  candidatePromise,
}: CandidateTagsSectionProps) {
  const candidate = await candidatePromise;

  return <CandidateTags tags={candidate.tags} />;
}
