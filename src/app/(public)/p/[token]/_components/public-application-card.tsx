import { Briefcase, CircleAlert } from "lucide-react";

import type { JobOpeningStatus } from "~/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { getApplicationStatusBadge } from "../utils";
import { PublicAttribute } from "./public-attribute";

type PublicApplicationCardProps = {
  jobOpeningName: string;
  jobOpeningStatus?: JobOpeningStatus;
  currentStage: string;
  areaName?: string | null;
  availability?: string | null;
  location?: string | null;
  salary?: string | null;
  includeSalary: boolean;
  active?: boolean;
  disqualificationMotive?: string | null;
  disqualificationDescription?: string | null;
};

export function PublicApplicationCard({
  jobOpeningName,
  jobOpeningStatus = "Open",
  currentStage,
  areaName,
  availability,
  location,
  salary,
  includeSalary,
  active = true,
  disqualificationMotive,
  disqualificationDescription,
}: PublicApplicationCardProps) {
  const status = getApplicationStatusBadge(active, jobOpeningStatus);

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <Briefcase className="size-4 shrink-0 text-text-secondary" />
          <CardTitle className="text-h3 text-text-primary">
            Postulación · {jobOpeningName}
          </CardTitle>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.badgeClass}`}
        >
          <span className={`size-1.5 rounded-full ${status.dotClass}`} />
          {status.label} · {currentStage}
        </span>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PublicAttribute label="Vacante" value={jobOpeningName} />

          <PublicAttribute label="Área" value={areaName} />

          <PublicAttribute label="Etapa actual" value={currentStage} />

          <PublicAttribute label="Disponibilidad" value={availability} />

          <PublicAttribute label="Modalidad" value={location} />

          {includeSalary && (
            <PublicAttribute label="Salario pretendido" value={salary} />
          )}
        </div>

        {!active && (
          <div className="rounded-xl border border-danger/25 bg-danger-bg/40 p-4">
            <div className="flex items-center gap-2 text-label font-bold tracking-wider text-danger uppercase">
              <CircleAlert className="size-4 shrink-0" />
              <span>Motivo de descalificación</span>
            </div>

            <p className="mt-1.5 text-sm font-semibold text-text-primary">
              {disqualificationMotive ?? "Sin motivo especificado"}
            </p>

            {disqualificationDescription && (
              <div className="mt-3 border-t border-danger/15 pt-3">
                <p className="text-label font-bold tracking-wider uppercase text-text-tertiary">
                  Descripción
                </p>
                <p className="mt-1 whitespace-pre-wrap wrap-anywhere text-xs leading-relaxed text-text-secondary">
                  {disqualificationDescription}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
