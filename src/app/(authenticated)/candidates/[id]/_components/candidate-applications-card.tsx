"use client";

import { useState } from "react";
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
import { Card, CardContent } from "~/components/ui/card";
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

const linkClass =
  "group inline-flex h-auto p-0 text-sm font-medium text-text-link transition hover:text-info hover:underline hover:underline-offset-2";
const linkIconClass =
  "h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5";
const outlineBtnClass =
  "rounded-full border-border-strong bg-background text-xs font-medium text-tag-gray-fg shadow-none hover:bg-tag-gray-bg";

type CandidateApplicationsCardProps = {
  applications: {
    applicantId: string;
    jobOpeningId: string;
    applicationDate: Date | string;
    currentStage: string;
    active: boolean;
    desiredSalary?: string | null;
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

export function CandidateApplicationsCard({
  applications,
}: CandidateApplicationsCardProps) {
  const [selectedId, setSelectedId] = useState(applications[0]?.jobOpeningId);

  const app =
    applications.find((a) => a.jobOpeningId === selectedId) || applications[0];

  if (!app) {
    return (
      <section className="rounded-xl border border-border-default bg-background p-6 text-sm text-text-tertiary">
        No hay postulaciones registradas para este candidato.
      </section>
    );
  }

  const { interviews = [], jobOpening, active } = app;
  const details = [
    ["Etapa actual", app.currentStage],
    [
      "Postuló",
      app.applicationDate
        ? format(new Date(app.applicationDate), "d MMM yyyy", { locale: es })
        : "—",
    ],
    ["Salario pretendido", app.desiredSalary || "—"],
    ["Disponibilidad", app.availability || "Inmediata"],
  ];

  return (
    <Card className="flex flex-col divide-y divide-border-default overflow-hidden bg-background">
      <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Postulación
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex h-auto min-h-9 max-w-full items-center gap-2 rounded-xl border border-border-strong bg-background py-1.5 pl-3 pr-8 text-left text-sm font-semibold text-text-primary transition hover:border-text-tertiary hover:bg-tag-gray-bg focus-visible:ring-2 focus-visible:ring-tag-gray-bg data-[state=open]:ring-2 data-[state=open]:ring-tag-gray-bg">
              <Briefcase className="h-4 w-4 shrink-0 text-text-secondary" />
              <span className="min-w-0 max-w-80 truncate">
                {jobOpening.name}
              </span>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-text-tertiary" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="max-h-60 w-full min-w-70 overflow-y-auto rounded-xl border border-border-strong p-1.5 shadow-lg"
            >
              {applications.map((a) => (
                <DropdownMenuItem
                  key={a.jobOpeningId}
                  onClick={() => setSelectedId(a.jobOpeningId)}
                  className={cn(
                    "flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors data-[highlighted]:bg-tag-gray-bg data-[highlighted]:text-text-primary",
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
            className={
              active
                ? "border-transparent bg-info-bg text-info"
                : "border-transparent bg-warning-bg text-warning"
            }
          >
            <span
              className={cn(
                "mr-1.5 h-1.5 w-1.5 rounded-full",
                active ? "bg-info" : "bg-warning",
              )}
            />
            {active ? "En proceso" : "Cerrada"}
          </Badge>

          <a
            href="#"
            className={linkClass}
          >
            Ver vacante <ArrowUpRight className={linkIconClass} />
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className={cn(outlineBtnClass, "gap-2 px-4 text-text-primary")}
          >
            <Share2 className="h-3.5 w-3.5" /> Compartir
          </Button>
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
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-2 p-6 text-sm text-text-secondary">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="inline">{label}: </dt>
            <dd className="inline font-bold text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>

      <CardContent>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-text-primary">
            Historial de entrevistas
          </h3>
          <Button
            variant="outline"
            size="sm"
            className={cn(outlineBtnClass, "gap-1.5 px-4 text-text-primary")}
          >
            <Plus className="h-3.5 w-3.5 text-tag-gray-fg" /> Agregar entrevista
          </Button>
        </div>

        {interviews.length === 0 ? (
          <div className="py-6 text-sm text-text-tertiary">
            No hay entrevistas registradas para esta postulación.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instancia</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Entrevistador/es</TableHead>
                <TableHead>Resumen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell className="min-w-50">
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

                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {interview.date
                      ? format(new Date(interview.date), "d MMM yyyy", {
                          locale: es,
                        })
                      : "—"}
                  </TableCell>

                  <TableCell className="min-w-50 text-text-secondary">
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

                  <TableCell>
                    {interview.summary ? (
                      <a
                        href={interview.summary}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Ver resumen <ArrowUpRight className={linkIconClass} />
                      </a>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
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
