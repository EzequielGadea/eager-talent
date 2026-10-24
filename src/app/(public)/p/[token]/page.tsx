import type { Metadata } from "next";
import { Suspense } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Lock } from "lucide-react";

import { api } from "~/lib/trpc/server";
import { PublicHeader } from "./_components/public-header";
import { PublicCandidateCard } from "./_components/public-candidate-card";
import { PublicApplicationCard } from "./_components/public-application-card";
import { PublicDocumentsCard } from "./_components/public-documents-card";
import { PublicInterviewsCard } from "./_components/public-interviews-card";
import { PublicLinkError } from "./_components/public-link-error";
import { PublicApplicationFallback } from "./_components/public-application-fallback";

export const metadata: Metadata = {
  title: "Perfil compartido | EagerTalent",
};

type PublicApplicationPageProps = {
  params: Promise<{ token: string }>;
};

export default function PublicApplicationPage({
  params,
}: PublicApplicationPageProps) {
  return (
    <Suspense fallback={<PublicApplicationFallback />}>
      <PublicApplicationContent params={params} />
    </Suspense>
  );
}

async function PublicApplicationContent({
  params,
}: PublicApplicationPageProps) {
  const { token } = await params;

  const result = await api.publicLink.getByToken({ token });

  if (result.status !== "active") {
    return <PublicLinkError reason={result.status} />;
  }

  const { candidate, application, recruiterName, expirationDate, interviews } =
    result;

  const formattedExpirationDate = format(
    new Date(expirationDate),
    "d MMM yyyy",
    { locale: es },
  );

  const formattedInterviews = interviews.map((interview) => ({
    ...interview,
    date: interview.date
      ? format(new Date(interview.date), "d MMM yyyy", { locale: es })
      : null,
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
        <PublicHeader recruiterName={recruiterName} />

        <PublicCandidateCard
          name={candidate.name}
          lastName={candidate.lastName}
          photo={candidate.photo}
          roleName={candidate.roleName}
          seniorityName={candidate.seniorityName}
          email={candidate.email}
          phone={candidate.phone}
          country={candidate.country}
          englishLevel={candidate.englishLevel}
          title={candidate.title}
          academicInstitution={candidate.academicInstitution}
          active={application.active}
          jobOpeningStatus={application.jobOpeningStatus}
        />

        <PublicApplicationCard
          jobOpeningName={application.jobOpeningName}
          jobOpeningStatus={application.jobOpeningStatus}
          currentStage={application.currentStage}
          areaName={application.areaName}
          availability={application.availability}
          location={application.location}
          salary={application.salary}
          includeSalary={application.includeSalary}
          active={application.active}
          disqualificationMotive={application.disqualificationMotive}
          disqualificationDescription={application.disqualificationDescription}
        />

        <PublicDocumentsCard
          resumeUrl={candidate.resumeUrl}
          educationUrl={candidate.educationUrl}
        />

        <PublicInterviewsCard interviews={formattedInterviews} />

        <footer className="flex items-center gap-2 pt-1 pb-6 text-xs text-text-tertiary">
          <Lock className="size-3.5 shrink-0" />
          <p>
            Compartido de forma segura via EagerTalent · La información visible
            fue seleccionada por el reclutador · Link válido hasta{" "}
            {formattedExpirationDate}.
          </p>
        </footer>
      </div>
    </div>
  );
}
