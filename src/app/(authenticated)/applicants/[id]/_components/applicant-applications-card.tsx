"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  ChevronDown,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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

type ApplicantApplicationsCardProps = {
  canCreatePublicLink: boolean;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
  applications: {
    applicantId: string;
    jobOpeningId: string;
    applicationDate: Date | string;
    currentStage: string;
    active: boolean;
    desiredSalaryAmount?: string | null;
    desiredSalaryCurrency?: string | null;
    availability?: string | null;
    jobOpening: { id: string; name: string };
    interviews: {
      id: string;
      name: string;
      duration: number;
      modality: string;
      date: Date | string | null;
      status: string;
      summary: string | null;
      interviewers: { name: string; lastName: string }[];
    }[];
  }[];
};

export function ApplicantApplicationsCard({
  applications,
  canCreatePublicLink,
  canUpdateApplication,
  canCreateInterview,
}: ApplicantApplicationsCardProps) {
  const [selectedId, setSelectedId] = useState(applications[0]?.jobOpeningId);

  const app =
    applications.find((a) => a.jobOpeningId === selectedId) || applications[0];

  if (!app) {
    return (
      <Card className="border border-border-default bg-card p-6 text-sm text-text-tertiary">
        No hay postulaciones registradas para este candidato.
      </Card>
    );
  }

  const { interviews = [], jobOpening, active } = app;
  const desiredSalary = [app.desiredSalaryCurrency, app.desiredSalaryAmount]
    .filter(Boolean)
    .join(" ");

  const details = [
    { label: "Etapa actual", value: app.currentStage },
    {
      label: "Postuló",
      value: app.applicationDate
        ? format(new Date(app.applicationDate), "d MMM yyyy", { locale: es })
        : "—",
    },
    { label: "Salario pretendido", value: desiredSalary || "—" },
    { label: "Disponibilidad", value: app.availability || "Inmediata" },
  ];

  return (
    <Card className="bg-card p-0">
      <CardHeader className="flex flex-wrap items-center gap-x-3 gap-y-3 px-6 py-4">
        <div className="flex min-w-0 flex-1 basis-full flex-wrap items-center gap-2.5 lg:basis-auto">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Postulación
          </CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex h-auto min-h-9 w-full max-w-full items-center gap-2 rounded-xl border border-border-strong bg-background py-1.5 pl-3 pr-8 text-left text-sm font-semibold text-text-primary transition hover:border-text-tertiary hover:bg-tag-gray-bg focus-visible:ring-2 focus-visible:ring-tag-gray-bg data-[state=open]:ring-2 data-[state=open]:ring-tag-gray-bg sm:w-52 lg:w-60">
              <Briefcase className="h-4 w-4 shrink-0 text-text-secondary" />
              <span className="min-w-0 flex-1 truncate">{jobOpening.name}</span>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-text-tertiary" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="max-h-60 w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border-strong p-1.5 shadow-lg"
            >
              {applications.map((a) => (
                <DropdownMenuItem
                  key={a.jobOpeningId}
                  onClick={() => setSelectedId(a.jobOpeningId)}
                  className={cn(
                    "flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors data-highlighted:bg-tag-gray-bg data-highlighted:text-text-primary",
                    selectedId === a.jobOpeningId
                      ? "bg-tag-gray-bg font-semibold text-text-primary"
                      : "font-medium text-tag-gray-fg hover:bg-tag-gray-bg hover:text-text-primary",
                  )}
                >
                  <span className="wrap-break-word whitespace-normal">
                    {a.jobOpening.name}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Badge
            className={cn(
              "shrink-0",
              active
                ? "border-transparent bg-info-bg text-info"
                : "border-transparent bg-warning-bg text-warning",
            )}
          >
            <span
              className={cn(
                "mr-1.5 h-1.5 w-1.5 rounded-full",
                active ? "bg-info" : "bg-warning",
              )}
            />
            {active ? "En proceso" : "Cerrada"}
          </Badge>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2.5 lg:w-auto">
          <Link
            href={`/jobOpening/${encodeURIComponent(jobOpening.id)}`}
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
      </CardHeader>

      <Separator className="bg-border-default" />

      <CardContent className="p-0">
        <dl className="flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-sm text-text-secondary">
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt className="inline">{label}: </dt>
              <dd className="inline font-bold text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>

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
            No hay entrevistas registradas para esta postulación.
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
