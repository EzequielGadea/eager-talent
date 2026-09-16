import { CircleHelp, FileText, GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { getCandidate } from "../_lib/get-candidate";
import { hearAboutUsLabels } from "../_lib/candidate-labels";
import { getSafeExternalUrl } from "../_lib/external-url";

type CandidateInfoCardsProps = { candidateId: string };

export async function CandidateInfoCards({
  candidateId,
}: CandidateInfoCardsProps) {
  const {
    education,
    academicInstitution,
    careerStartYear,
    careerEndYear,
    hearAboutUs,
    resume,
  } = await getCandidate(candidateId);
  const resumeUrl = getSafeExternalUrl(resume);
  const careerYears =
    careerStartYear || careerEndYear
      ? `${careerStartYear ?? "?"}–${careerEndYear ?? "Actualidad"}`
      : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <InfoCard
        icon={<GraduationCap className="size-4 text-accent-purple" />}
        title="Formación académica"
      >
        <p className="font-semibold">{education ?? "Sin información"}</p>

        {academicInstitution && (
          <p className="text-muted-foreground">{academicInstitution}</p>
        )}

        {careerYears && <p className="text-muted-foreground">{careerYears}</p>}
      </InfoCard>

      <InfoCard
        icon={<CircleHelp className="size-4 text-accent-green" />}
        title="¿Cómo escuchaste de nosotros?"
      >
        <p className="font-semibold">
          {hearAboutUs ? hearAboutUsLabels[hearAboutUs] : "Sin información"}
        </p>
      </InfoCard>

      <InfoCard icon={<FileText className="size-4 text-info" />} title="CV">
        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-text-link hover:underline"
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
    <Card size="sm" className="min-w-0">
      <CardHeader className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0">{icon}</span>

        <CardTitle className="min-w-0 wrap-anywhere">
          <h2>{title}</h2>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-w-0 flex-col gap-1 wrap-anywhere text-sm">
        {children}
      </CardContent>
    </Card>
  );
}
