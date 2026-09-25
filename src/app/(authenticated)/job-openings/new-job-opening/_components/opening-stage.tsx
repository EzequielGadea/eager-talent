"use client";

import { JobOpeningFormValues } from "./new-job-opening-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GripVertical, X, Plus, Info, ChevronDown } from "lucide-react";

export default function OpeningStage() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

  const stages = [
    { name: "Revisión Inicial" },
    { name: "Entrevista Técnica" },
    { name: "Entrevista Cultural" },
    { name: "Oferta" },
  ];

  return (
    <Card className="w-full rounded-x1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Flujo del proceso{" "}
          <span className="ml-2 align-middle text-xs font-normal text-text-tertiary">
            arrastrá para reordenar
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-1">
          <div className="space-y-2">
            {stages.map((stage, index) => (
              <div
                key={index}
                className="flex h-12 items-center gap-4 rounded-lg border border-border-default bg-surface-card p-3 transition-colors hover:bg-surface-hover "
              >
                <GripVertical className="h-4 w-4 cursor-grab text-text-tertiary hover:text-text-secondary" />
                <span className="w-4 text-[13px] font-medium text-text-tertiary">
                  {index + 1}
                </span>
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="flex-1 text-[13px] font-medium text-text-primary">
                  {stage.name}
                </span>
                <div className="flex items-center gap-1 flex-nowrap rounded-full border border-border-default px-3 py-1 text-[12px] font-medium text-text-secondary">
                  Entrevista
                  <ChevronDown className="h-3 w-3 text-text-tertiary" />
                </div>
                <button className="flex items-center justify-center rounded-md p-1 hover:bg-surface-sunken">
                  <X className="h-4 w-4 text-text-tertiary hover:text-text-secondary" />
                </button>
              </div>
            ))}
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover">
            <Plus className="h-4 w-4" />
            Agregar etapa
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
