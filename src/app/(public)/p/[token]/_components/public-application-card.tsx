import { Briefcase } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type PublicApplicationCardProps = {
  jobOpeningName: string;
  currentStage: string;
  areaName?: string | null;
  availability?: string | null;
  location?: string | null;
  salary?: string | null;
  includeSalary: boolean;
  active?: boolean;
};

export function PublicApplicationCard({
  jobOpeningName,
  currentStage,
  areaName,
  availability,
  location,
  salary,
  includeSalary,
  active = true,
}: PublicApplicationCardProps) {
  const statusLabel = active ? "En proceso" : "Descartado";
  const badgeClass = active
    ? "bg-info-bg text-info"
    : "bg-danger-bg text-danger";
  const dotClass = active ? "bg-info" : "bg-danger";

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
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
        >
          <span className={`size-1.5 rounded-full ${dotClass}`} />
          {statusLabel} · {currentStage}
        </span>
      </CardHeader>

      <Separator />

      <CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </CardContent>
    </Card>
  );
}
