import { CircleHelp, FileText, GraduationCap } from "lucide-react";
import type { HearAboutUs } from "~/generated/prisma/enums";
import { hearAboutUsLabels } from "../_lib/candidate-labels";
import { getSafeExternalUrl } from "../_lib/external-url";

type CandidateInfoCardsProps = {
  education: string | null;
  academicInstitution: string | null;
  careerStartYear: number | null;
  careerEndYear: number | null;
  hearAboutUs: HearAboutUs | null;
  resume: string | null;
};

export function CandidateInfoCards({
  education,
  academicInstitution,
  careerStartYear,
  careerEndYear,
  hearAboutUs,
  resume,
}: CandidateInfoCardsProps) {
  const resumeUrl = getSafeExternalUrl(resume);
  const careerYears =
    careerStartYear || careerEndYear
      ? `${careerStartYear ?? "?"}–${careerEndYear ?? "Actualidad"}`
      : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <InfoCard
        icon={<GraduationCap className="h-4 w-4 text-violet-500" />}
        title="Formación académica"
      >
        <p className="font-semibold">{education ?? "Sin información"}</p>

        {academicInstitution && (
          <p className="text-muted-foreground">{academicInstitution}</p>
        )}

        {careerYears && <p className="text-muted-foreground">{careerYears}</p>}
      </InfoCard>

      <InfoCard
        icon={<CircleHelp className="h-4 w-4 text-emerald-500" />}
        title="¿Cómo escuchaste de nosotros?"
      >
        <p className="font-semibold">
          {hearAboutUs ? hearAboutUsLabels[hearAboutUs] : "Sin información"}
        </p>
      </InfoCard>

      <InfoCard
        icon={<FileText className="h-4 w-4 text-blue-500" />}
        title="CV"
      >
        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline"
          >
            Ver CV
          </a>
        ) : (
          <p className="text-muted-foreground">Sin CV cargado</p>
        )}
      </InfoCard>

      {/* The transcript card will be integrated when its document field is available. */}
    </div>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

function InfoCard({ icon, title, children }: InfoCardProps) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
        <span className="mt-0.5 shrink-0">{icon}</span>

        <h2 className="font-semibold leading-tight text-muted-foreground">
          {title}
        </h2>
      </div>

      <div className="space-y-1 text-sm">{children}</div>
    </section>
  );
}
