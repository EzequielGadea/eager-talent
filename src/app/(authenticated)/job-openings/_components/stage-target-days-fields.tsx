"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "~/components/ui/input";

type StageTargetDaysField = {
  stageKey: string;
  stageName: string;
  error?: string;
  inputProps: UseFormRegisterReturn;
};

// Target days of the metric stages, shown inside the "Flujo del proceso" card
// when creating and editing a job opening.
export function StageTargetDaysFields({
  fields,
}: {
  fields: StageTargetDaysField[];
}) {
  if (fields.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border-default pt-4">
      <div>
        <p className="text-sm font-medium text-text-primary">
          Días objetivo por etapa
        </p>
        <p className="text-xs text-text-tertiary">
          Días desde la apertura de la vacante. Se usan para calcular el desvío
          de cada etapa en las métricas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <Input
            key={field.stageKey}
            id={`metric-stage-target-${field.stageKey}`}
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            step={1}
            label={`${field.stageName} (días) *`}
            placeholder="Ej: 7"
            errorMessage={field.error}
            {...field.inputProps}
          />
        ))}
      </div>
    </div>
  );
}
