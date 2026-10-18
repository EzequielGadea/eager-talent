import { Briefcase, CircleAlert } from "lucide-react";

import type { JobOpeningStatus } from "~/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { getApplicationStatusBadge } from "../utils";

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
          <CardTitle className="text-base font-bold text-text-primary">
            Postulación · {jobOpeningName}
          </CardTitle>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.badgeClass}`}
        >
          <span className={`size-1.5 rounded-full ${status.dotClass}`} />
          {status.label} · {currentStage}
        </span>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 wrap-anywhere">
            <p className="text-xs font-semibold uppercase text-text-tertiary">
              Vacante
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {jobOpeningName}
            </p>
          </div>

          <div className="min-w-0 wrap-anywhere">
            <p className="text-xs font-semibold uppercase text-text-tertiary">
              Área
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {areaName ?? "Sin área"}
            </p>
          </div>

          <div className="min-w-0 wrap-anywhere">
            <p className="text-xs font-semibold uppercase text-text-tertiary">
              Etapa actual
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {currentStage}
            </p>
          </div>

          <div className="min-w-0 wrap-anywhere">
            <p className="text-xs font-semibold uppercase text-text-tertiary">
              Disponibilidad
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {availability ?? "Sin información"}
            </p>
          </div>

          <div className="min-w-0 wrap-anywhere">
            <p className="text-xs font-semibold uppercase text-text-tertiary">
              Modalidad
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {location ?? "Sin información"}
            </p>
          </div>

          {includeSalary && (
            <div className="min-w-0 wrap-anywhere">
              <p className="text-xs font-semibold uppercase text-text-tertiary">
                Salario pretendido
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {salary ?? "Sin información"}
              </p>
            </div>
          )}
        </div>

        {!active && (
          <div className="rounded-xl border border-danger/25 bg-danger-bg/40 p-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-danger uppercase">
              <CircleAlert className="size-4 shrink-0" />
              <span>Motivo de descalificación</span>
            </div>

            <p className="mt-1.5 text-sm font-semibold text-text-primary">
              {disqualificationMotive ?? "Sin motivo especificado"}
            </p>

            {disqualificationDescription && (
              <div className="mt-3 border-t border-danger/15 pt-3">
                <p className="text-[11px] font-semibold uppercase text-text-tertiary">
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
