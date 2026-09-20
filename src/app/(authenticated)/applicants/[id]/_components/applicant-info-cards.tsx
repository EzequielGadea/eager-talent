import { CircleHelp, Download, File, GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { api } from "~/lib/trpc/server";
import { hearAboutUsLabels } from "../_lib/applicant-labels";
import { getSafeExternalUrl } from "../_lib/external-url";

type ApplicantPromise = Promise<
  Awaited<ReturnType<typeof api.applicant.getById>>
>;
type ApplicantInfoCardsProps = { applicantPromise: ApplicantPromise };

export async function ApplicantInfoCards({
  applicantPromise,
}: ApplicantInfoCardsProps) {
  const {
    title,
    education,
    academicInstitution,
    careerStartYear,
    careerEndYear,
    hearAboutUs,
    resume,
  } = await applicantPromise;
  const careerYears =
    careerStartYear || careerEndYear
      ? `${careerStartYear ?? "?"}–${careerEndYear ?? "Actualidad"}`
      : null;

  return (
    <div className="@container">
      <div className="grid gap-3 @min-[360px]:grid-cols-2 @min-[640px]:grid-cols-4">
        <InfoCard
          icon={<GraduationCap className="size-3.5 text-accent-purple" />}
          title="Formación académica"
        >
          <p className="font-semibold">{title?.trim() || "Sin información"}</p>

          {(academicInstitution || careerYears) && (
            <p className="text-xs text-muted-foreground">
              {academicInstitution}
              {academicInstitution && careerYears && " · "}
              {careerYears}
            </p>
          )}
        </InfoCard>

        <InfoCard
          icon={<CircleHelp className="size-3.5 text-accent-green" />}
          title="¿Cómo escuchaste de nosotros?"
        >
          <p className="font-semibold">
            {hearAboutUs ? hearAboutUsLabels[hearAboutUs] : "Sin información"}
          </p>
        </InfoCard>

        <DocumentCard title="CV" value={resume} emptyMessage="Sin CV cargado" />
        <DocumentCard
          title="Escolaridad"
          value={education}
          emptyMessage="Sin escolaridad cargada"
          iconClassName="text-warning"
        />
      </div>
    </div>
  );
}

type DocumentCardProps = {
  title: string;
  value: string | null;
  emptyMessage: string;
  iconClassName?: string;
};

function DocumentCard({
  title,
  value,
  emptyMessage,
  iconClassName = "text-info",
}: DocumentCardProps) {
  const documentValue = value?.trim();
  const documentUrl = getSafeExternalUrl(documentValue || null);

  return (
    <InfoCard
      icon={<File className={`size-3.5 ${iconClassName}`} />}
      title={title}
    >
      {documentUrl ? (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Descargar ${title}`}
          className={cn(
            buttonVariants({
              variant: "link",
              size: "sm",
              className:
                "h-auto w-fit max-w-full gap-1 rounded-sm p-0 text-sm font-normal text-text-link",
            }),
          )}
        >
          Descargar
          <Download className="size-3" aria-hidden="true" />
        </a>
      ) : (
        <>
          <p className="text-muted-foreground">{emptyMessage}</p>
          <Button
            variant="link"
            size="sm"
            className="h-auto w-fit max-w-full gap-1 rounded-sm p-0 text-sm font-normal text-text-link"
            aria-label={`Descargar ${title}`}
            disabled
          >
            Descargar
            <Download className="size-3" aria-hidden="true" />
          </Button>
        </>
      )}
    </InfoCard>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

function InfoCard({ icon, title, children }: InfoCardProps) {
  return (
    <Card size="sm" className="min-w-0 shadow-sm">
      <CardHeader className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0">{icon}</span>

        <CardTitle className="min-w-0 wrap-anywhere text-xs font-semibold text-text-secondary group-data-[size=sm]/card:text-xs">
          <h2>{title}</h2>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-w-0 flex-col gap-1 wrap-anywhere text-sm">
        {children}
      </CardContent>
    </Card>
  );
}
