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
  const candidate = await candidatePromise;

  return (
    <>
      <CandidateOverviewCard
        name={candidate.name}
        lastName={candidate.lastName}
        photo={candidate.photo}
        email={candidate.email}
        phone={candidate.phone}
        country={candidate.country}
        linkedin={candidate.linkedin}
        title={candidate.title}
        source={candidate.source}
        englishLevel={candidate.englishLevel}
        role={candidate.role}
        seniority={candidate.seniority}
      />

      <CandidateInfoCards
        education={candidate.education}
        academicInstitution={candidate.academicInstitution}
        careerStartYear={candidate.careerStartYear}
        careerEndYear={candidate.careerEndYear}
        hearAboutUs={candidate.hearAboutUs}
        resume={candidate.resume}
      />

      {/* Applications will be integrated here in a separate task. */}
    </>
  );
}
