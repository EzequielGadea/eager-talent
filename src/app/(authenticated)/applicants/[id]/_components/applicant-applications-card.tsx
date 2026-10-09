"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Share2, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Separator } from "~/components/ui/separator";
import { getSafeExternalUrl } from "../_lib/external-url";
import { ApplyToVacantDialog } from "./apply-to-vacant-dialog";
import {
  ApplicantApplicationDropdown,
  type ApplicationSelection,
} from "./applicant-application-dropdown";

export type Interview = {
  id: string;
  name: string;
  duration: number;
  modality: string;
  date: Date | string | null;
  status: string;
  summary: string | null;
  interviewers: { name: string; lastName: string }[];
};

export type ApplicationSummary = {
  applicantId: string;
  jobOpeningId: string;
  applicationDate: Date | string;
  currentStage: string;
  active: boolean;
  disqualificationDescription?: string | null;
  desiredSalaryAmount?: string | null;
  desiredSalaryCurrency?: string | null;
  availability?: string | null;
  jobOpening: { id: string; name: string };
  interviews: Interview[];
};

type ApplicantApplicationsCardProps = {
  applicantId: string;
  applicantName: string;
  canCreatePublicLink: boolean;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
  canCreateApplication: boolean;
  applications: ApplicationSummary[];
  explorationInterviews?: Interview[];
};

function getHeaderApplicationStatus(application: { active: boolean }) {
  return application.active
    ? {
        label: "En proceso",
        badgeClassName: "bg-info-bg text-info",
        dotClassName: "bg-info",
      }
    : {
        label: "Descartado",
        badgeClassName: "bg-danger-bg text-danger",
        dotClassName: "bg-danger",
      };
}

function getInitialSelection(
  applications: ApplicationSummary[],
  explorationInterviews: Interview[],
): ApplicationSelection | undefined {
  if (applications[0]) {
    return { type: "application", jobOpeningId: applications[0].jobOpeningId };
  }
  return explorationInterviews.length > 0 ? { type: "exploration" } : undefined;
}

export function ApplicantApplicationsCard({
  applicantId,
  applicantName,
  applications,
  explorationInterviews = [],
  canCreatePublicLink,
  canUpdateApplication,
  canCreateInterview,
  canCreateApplication,
}: ApplicantApplicationsCardProps) {
  const [selection, setSelection] = useState<ApplicationSelection | undefined>(
    () => getInitialSelection(applications, explorationInterviews),
  );
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const effectiveSelection =
    selection ?? getInitialSelection(applications, explorationInterviews);

  const isExploration = effectiveSelection?.type === "exploration";
  const app =
    effectiveSelection?.type === "application"
      ? (applications.find(
          (a) => a.jobOpeningId === effectiveSelection.jobOpeningId,
        ) ?? applications[0])
      : undefined;

  if (!app && !isExploration) {
    return (
      <>
        <Card className="border border-border-default bg-card">
          <CardContent className="flex min-h-36 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-text-tertiary">
              No hay postulaciones registradas para este candidato.
            </p>
            {canCreateApplication && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto gap-2 rounded-lg border border-dashed border-info px-3 text-xs font-semibold text-text-link hover:bg-info-bg hover:text-text-link"
                onClick={() => setShowApplyDialog(true)}
              >
                <Plus className="size-3.5" />
                Postular a una vacante
              </Button>
            )}
          </CardContent>
        </Card>
        {canCreateApplication && (
          <ApplyToVacantDialog
            showDialog={showApplyDialog}
            setShowDialog={setShowApplyDialog}
            applicantId={applicantId}
          />
        )}
      </>
    );
  }

  const interviews = isExploration
    ? explorationInterviews
    : (app?.interviews ?? []);
  const jobOpening = app?.jobOpening;
  const headerStatus = app ? getHeaderApplicationStatus(app) : null;
  const desiredSalary = app
    ? [app.desiredSalaryCurrency, app.desiredSalaryAmount]
        .filter(Boolean)
        .join(" ")
    : "";

  const details = app
    ? [
        { label: "Etapa actual", value: app.currentStage },
        {
          label: "Postuló",
          value: app.applicationDate
            ? format(new Date(app.applicationDate), "d MMM yyyy", {
                locale: es,
              })
            : "—",
        },
        { label: "Salario pretendido", value: desiredSalary || "—" },
        { label: "Disponibilidad", value: app.availability || "Inmediata" },
      ]
    : [];

  return (
    <Card className="bg-card p-0">
      <CardHeader className="flex flex-wrap items-center gap-x-3 gap-y-3 px-6 py-4">
        <div className="flex min-w-0 flex-1 basis-full flex-wrap items-center gap-2.5 lg:basis-auto">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Postulación
          </CardTitle>

          <ApplicantApplicationDropdown
            applicantName={applicantName}
            applications={applications}
            explorationInterviews={explorationInterviews}
            selection={effectiveSelection}
            onSelectionChange={setSelection}
            canCreateApplication={canCreateApplication}
            onCreateApplication={() => setShowApplyDialog(true)}
          />

          {headerStatus && (
            <Badge
              className={cn(
                "shrink-0 border-transparent",
                headerStatus.badgeClassName,
              )}
            >
              <span
                className={cn(
                  "mr-1.5 h-1.5 w-1.5 rounded-full",
                  headerStatus.dotClassName,
                )}
              />
              {headerStatus.label}
            </Badge>
          )}
          {isExploration && (
            <Badge className="shrink-0 border-transparent bg-tag-purple-bg text-tag-purple-fg">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-tag-purple-fg" />
              Sin postulación
            </Badge>
          )}
        </div>

        {!isExploration && jobOpening && (
          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2.5 lg:w-auto">
            <Link
              href={`/job-openings/${encodeURIComponent(jobOpening.id)}`}
              className="group inline-flex h-auto shrink-0 p-0 text-sm font-medium text-text-link transition hover:text-info hover:underline hover:underline-offset-2"
            >
              Ver vacante{" "}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            {canCreatePublicLink && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full border-border-strong bg-background px-4 text-xs font-medium text-text-primary shadow-none hover:bg-tag-gray-bg"
              >
                <Share2 className="h-3.5 w-3.5" /> Compartir
              </Button>
            )}
            {canUpdateApplication && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full border-danger bg-background px-3.5 text-xs font-medium text-danger shadow-none hover:bg-danger-bg hover:text-tag-red-fg"
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-danger">
                  <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                </span>
                Descalificar
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <Separator className="bg-border-default" />

      <CardContent className="p-0">
        {isExploration ? (
          <p className="px-6 py-4 text-sm text-text-secondary">
            Entrevistas exploratorias, no asociadas a una vacante.
          </p>
        ) : (
          <dl className="flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-sm text-text-secondary">
            {details.map(({ label, value }) => (
              <div key={label}>
                <dt className="inline">{label}: </dt>
                <dd className="inline font-bold text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>

      {canCreateApplication && (
        <ApplyToVacantDialog
          showDialog={showApplyDialog}
          setShowDialog={setShowApplyDialog}
          applicantId={applicantId}
        />
      )}

      <Separator className="bg-border-default" />

      <CardContent className="p-0 px-6 pb-6 pt-4">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <h3 className="min-w-0 text-base font-bold text-text-primary">
            Historial de entrevistas
          </h3>
          {canCreateInterview && (
            <Button
              variant="outline"
              size="sm"
              className="min-w-0 max-w-full gap-1.5 overflow-hidden rounded-full border-border-strong bg-background px-4 text-xs font-medium text-text-primary shadow-none hover:bg-tag-gray-bg sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-tag-gray-fg" />
              <span className="truncate">Agregar entrevista</span>
            </Button>
          )}
        </div>

        {interviews.length === 0 ? (
          <div className="py-6 text-sm text-text-tertiary">
            {isExploration
              ? "No hay entrevistas exploratorias registradas para este candidato."
              : "No hay entrevistas registradas para esta postulación."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 pb-4">Instancia</TableHead>
                <TableHead className="w-1/5 pb-4">Fecha</TableHead>
                <TableHead className="w-1/4 pb-4">Entrevistador/es</TableHead>
                <TableHead className="w-1/6 pb-4">Resumen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell className="w-1/3 py-4">
                    <p className="font-bold text-text-primary">
                      {interview.name}
                    </p>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      Entrevista{" "}
                      {interview.modality === "VideoCall"
                        ? "virtual"
                        : "presencial"}{" "}
                      de {interview.duration} minutos
                    </p>
                  </TableCell>

                  <TableCell className="w-1/5 whitespace-nowrap py-4 text-text-secondary">
                    {interview.date
                      ? format(new Date(interview.date), "d MMM yyyy", {
                          locale: es,
                        })
                      : "—"}
                  </TableCell>

                  <TableCell className="w-1/4 py-4 text-text-secondary">
                    {interview.interviewers.length > 0 ? (
                      <span className="block truncate">
                        {interview.interviewers
                          .map((p) => `${p.name} ${p.lastName}`)
                          .join(", ")}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    {(() => {
                      const summaryUrl = getSafeExternalUrl(interview.summary);

                      return summaryUrl ? (
                        <Link
                          href={summaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex h-auto p-0 text-sm font-medium text-text-link transition hover:text-info hover:underline hover:underline-offset-2"
                        >
                          Ver resumen{" "}
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
