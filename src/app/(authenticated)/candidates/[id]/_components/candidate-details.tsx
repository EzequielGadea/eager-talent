import { api } from "~/lib/trpc/server";
import { Suspense } from "react";

import { CandidateNotes } from "./candidate-notes";
import { CandidateOverviewCard } from "./candidate-overview-card";
import { CandidateTags } from "./candidate-tags";
import { CandidateInfoCards } from "./candidate-info-cards";
import { CandidateApplications } from "./candidate-applications";
import { CandidateLogs } from "./candidate-logs";

type CandidateDetailsProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function CandidateDetails({ params }: CandidateDetailsProps) {
  const { id } = await params;

  const candidate = await api.candidate.getById({
    id,
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <main className="flex min-w-0 flex-col gap-4">
        <CandidateOverviewCard
          name={candidate.name}
          lastName={candidate.lastName}
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

        <Suspense fallback={<div>Cargando postulación...</div>}>
          <CandidateApplications candidateId={id} />
        </Suspense>

        <Suspense fallback={<div>Cargando actividad...</div>}>
          <CandidateLogs candidateId={id} />
        </Suspense>
      </main>

      <aside className="min-w-0 space-y-4">
        <CandidateNotes />
        <CandidateTags tags={candidate.tags} />
      </aside>
    </div>
  );
}
