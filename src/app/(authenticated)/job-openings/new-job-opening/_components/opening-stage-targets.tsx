"use client";

import { useFormContext } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";

import type { JobOpeningFormValues } from "./new-job-opening-form";
import type { Stages } from "../utils";

export default function OpeningStageTargets(props: { stages: Stages }) {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

  const targets = getValues("metricStageTargets");

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-h3 text-text-primary">
          Días objetivo por etapa
        </CardTitle>
        <CardDescription className="text-xs text-text-tertiary">
          Se usan para calcular el desvío de cada etapa en las métricas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {targets.map((target, index) => {
            const stageName =
              props.stages.find((stage) => stage.key === target.stageKey)
                ?.name ?? target.stageKey;
            const inputId = `metric-stage-target-${target.stageKey}`;

            return (
              <Input
                key={target.stageKey}
                id={inputId}
                type="number"
                inputMode="numeric"
                min={1}
                max={365}
                step={1}
                label={`${stageName} (días) *`}
                placeholder="Ej: 7"
                errorMessage={
                  errors.metricStageTargets?.[index]?.targetDays?.message
                }
                {...register(`metricStageTargets.${index}.targetDays`, {
                  valueAsNumber: true,
                })}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
