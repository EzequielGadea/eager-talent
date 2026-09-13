import { api } from "~/lib/trpc/server";
import { Suspense } from "react";

import { CandidateNotes } from "./candidate-notes";
import { CandidateOverviewCard } from "./candidate-overview-card";
import { CandidateTags } from "./candidate-tags";
import { CandidateInfoCards } from "./candidate-info-cards";
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
          canEditProfile={candidate.permissions.canEditProfile}
        />

        <CandidateInfoCards
          education={candidate.education}
          academicInstitution={candidate.academicInstitution}
          careerStartYear={candidate.careerStartYear}
          careerEndYear={candidate.careerEndYear}
          hearAboutUs={candidate.hearAboutUs}
          resume={candidate.resume}
        />

        {/* La sección de postulaciones será integrada por su subtarea correspondiente */}

        <Suspense fallback={<div>Cargando actividad...</div>}>
          <CandidateLogs candidateId={id} />
        </Suspense>
      </main>

      <aside className="min-w-0 space-y-4">
        <Suspense fallback={<div>Cargando notas...</div>}>
          <CandidateNotes candidateId={id} />
        </Suspense>
        <CandidateTags 
          tags={candidate.tags} 
          canEditProfile={candidate.permissions.canEditProfile}
        />
      </aside>
    </div>
  );
}
