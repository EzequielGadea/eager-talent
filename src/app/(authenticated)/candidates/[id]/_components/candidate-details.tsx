import { api } from "~/lib/trpc/server";
import { Suspense } from "react";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import { CandidateOverviewCard } from "./candidate-overview-card";
import { CandidateTags } from "./candidate-tags";
import { CandidateInfoCards } from "./candidate-info-cards";
import { CandidateLogs } from "./candidate-logs";

type CandidateDetailsProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function CandidateDetails({
  params,
  searchParams,
}: CandidateDetailsProps) {
  const { id } = await params;

  const candidate = await api.candidate
    .getById({
      id,
    })
    .catch((error: unknown) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") {
        notFound();
      }
      throw error;
    });

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
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

        {candidate.permissions.canViewLogs && (
          <Suspense fallback={<div>Cargando actividad...</div>}>
            <CandidateLogs candidateId={id} searchParams={searchParams} />
          </Suspense>
        )}
      </main>

      <aside className="min-w-0 space-y-4">
        {/* Candidate notes will be integrated here in a separate task. */}
        <CandidateTags tags={candidate.tags} />
      </aside>
    </div>
  );
}
