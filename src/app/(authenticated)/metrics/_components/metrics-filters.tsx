"use client";

import { CalendarDays, LayoutGrid } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { MetricsPeriod } from "~/lib/validations/metrics";

const periodOptions: ReadonlyArray<{
  value: MetricsPeriod;
  label: string;
}> = [
  { value: "currentMonth", label: "Mes actual" },
  { value: "previousMonth", label: "Mes pasado" },
  { value: "currentQuarter", label: "Trimestre actual" },
  { value: "previousQuarter", label: "Trimestre pasado" },
  { value: "currentSemester", label: "Semestre actual" },
  { value: "previousSemester", label: "Semestre pasado" },
  { value: "currentYear", label: "Año actual" },
  { value: "previousYear", label: "Año pasado" },
  { value: "all", label: "Todo el período" },
];

type AreaOption = {
  id: string;
  name: string;
};

export function MetricsFilters({
  period,
  areaId,
  areas,
  onPeriodChange,
  onAreaChange,
}: {
  period: MetricsPeriod;
  areaId?: string;
  areas: AreaOption[];
  onPeriodChange: (period: MetricsPeriod) => void;
  onAreaChange: (areaId: string | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4" aria-label="Filtros de métricas">
      <Select
        value={period}
        onValueChange={(value) => {
          if (typeof value === "string") {
            onPeriodChange(value as MetricsPeriod);
          }
        }}
        items={periodOptions}
      >
        <SelectTrigger
          aria-label="Período"
          className="min-w-48 rounded-lg bg-card px-3 text-sm font-medium text-text-secondary shadow-none data-[size=default]:h-10"
        >
          <CalendarDays className="size-4 text-text-secondary" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-max min-w-[var(--anchor-width)] max-w-[calc(100vw-2rem)] rounded-lg p-1"
        >
          <SelectGroup className="p-0">
            {periodOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="min-h-10 px-3 pr-9 text-sm font-normal"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={areaId ?? "all"}
        onValueChange={(value) => {
          if (typeof value === "string") {
            onAreaChange(value === "all" ? undefined : value);
          }
        }}
        items={[
          { value: "all", label: "Todas las áreas" },
          ...areas.map((area) => ({ value: area.id, label: area.name })),
        ]}
      >
        <SelectTrigger
          aria-label="Área"
          className="min-w-48 rounded-lg bg-card px-3 text-sm font-medium text-text-secondary shadow-none data-[size=default]:h-10"
        >
          <LayoutGrid className="size-4 text-text-secondary" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-max min-w-[var(--anchor-width)] max-w-[calc(100vw-2rem)] rounded-lg p-1"
        >
          <SelectGroup className="p-0">
            <SelectItem
              value="all"
              className="min-h-10 px-3 pr-9 text-sm font-normal"
            >
              Todas las áreas
            </SelectItem>
            {areas.map((area) => (
              <SelectItem
                key={area.id}
                value={area.id}
                className="min-h-10 px-3 pr-9 text-sm font-normal"
              >
                {area.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
