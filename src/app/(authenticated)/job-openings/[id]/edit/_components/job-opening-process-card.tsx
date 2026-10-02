"use client";

import { GripVertical, Info, Plus, X } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import {
  jobOpeningStageTypeSchema,
  type JobOpeningStageType,
  type UpdateJobOpeningInput,
} from "~/lib/validations/job-opening";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription } from "~/components/ui/alert";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

const STAGE_COLOR_CLASS_NAMES = [
  "bg-text-secondary",
  "bg-info",
  "bg-accent-purple",
  "bg-warning",
];

const STAGE_TYPE_CLASS_NAMES: Record<JobOpeningStageType, string> = {
  none: "",
  interview: "bg-tag-blue-bg text-tag-blue-fg [&_svg]:text-tag-blue-fg",
  offer: "bg-tag-amber-bg text-tag-amber-fg [&_svg]:text-tag-amber-fg",
  hired: "bg-tag-green-bg text-tag-green-fg [&_svg]:text-tag-green-fg",
};

const STAGE_TYPE_OPTIONS: Array<{
  value: JobOpeningStageType;
  label: string;
}> = [
  { value: "none", label: "Ninguna" },
  { value: "interview", label: "Entrevista" },
  { value: "offer", label: "Oferta" },
  { value: "hired", label: "Contratado" },
];

type JobOpeningProcessCardProps = {
  canEditStages: boolean;
};

export function JobOpeningProcessCard({
  canEditStages,
}: JobOpeningProcessCardProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<UpdateJobOpeningInput>();

  const {
    fields: stages,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: "stages",
    keyName: "fieldKey",
  });

  function handleAddStage() {
    if (!canEditStages) {
      return;
    }
    append(
      {
        id: crypto.randomUUID(),
        name: "",
        type: "none",
      },
      {
        focusName: `stages.${stages.length}.name`,
      },
    );
  }

  function handleMoveStage(fromIndex: number, toIndex: number) {
    if (!canEditStages) {
      return;
    }
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= stages.length ||
      toIndex >= stages.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    move(fromIndex, toIndex);
  }

  const stageErrorMessage =
    typeof errors.stages?.message === "string"
      ? errors.stages.message
      : errors.stages?.root?.message;

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-baseline gap-2">
          <CardTitle className="font-heading text-[15px] font-bold tracking-[-0.01em] text-text-primary">
            Flujo del proceso
          </CardTitle>
          <CardDescription className="text-xs text-text-tertiary">
            {canEditStages
              ? "arrastrá para reordenar"
              : "flujo bloqueado después de su apertura"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <ol aria-live="polite" className="flex flex-col gap-2">
          {stages.map((stage, index) => (
            <li
              key={stage.fieldKey}
              className="flex items-center gap-2.5 rounded-lg border border-border-default px-2 py-2"
              onDragOver={(event) => {
                if (!canEditStages) {
                  return;
                }

                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                if (!canEditStages) {
                  return;
                }

                event.preventDefault();

                const fromIndex = Number(
                  event.dataTransfer.getData("text/plain"),
                );

                if (Number.isInteger(fromIndex)) {
                  handleMoveStage(fromIndex, index);
                }
              }}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                draggable={canEditStages}
                disabled={!canEditStages}
                aria-label={`Reordenar etapa ${stage.name}. Usa las flechas arriba y abajo.`}
                className={cn(
                  "text-text-tertiary",
                  canEditStages
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-not-allowed",
                )}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    handleMoveStage(index, index - 1);
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    handleMoveStage(index, index + 1);
                  }
                }}
              >
                <GripVertical aria-hidden="true" />
              </Button>
              <span className="w-3.5 shrink-0 text-center font-mono text-[11px] tabular-nums text-text-tertiary">
                {index + 1}
              </span>

              <span
                aria-hidden="true"
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  STAGE_COLOR_CLASS_NAMES[
                    index % STAGE_COLOR_CLASS_NAMES.length
                  ] ?? "bg-text-secondary",
                )}
              />

              <div className="min-w-0 flex-1">
                <Input
                  aria-label={`Nombre de la etapa ${index + 1}`}
                  placeholder="Nombre de la etapa"
                  readOnly={!canEditStages}
                  maxLength={80}
                  className={cn(
                    "h-7 border-transparent bg-transparent px-1 font-medium shadow-none",
                    canEditStages
                      ? "hover:border-border-default"
                      : "cursor-not-allowed text-text-secondary",
                  )}
                  errorMessage={errors.stages?.[index]?.name?.message}
                  {...register(`stages.${index}.name`)}
                />
              </div>

              <Controller
                control={control}
                name={`stages.${index}.type`}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={STAGE_TYPE_OPTIONS}
                    disabled={!canEditStages}
                    onValueChange={(value) => {
                      const parsedType =
                        jobOpeningStageTypeSchema.safeParse(value);

                      if (parsedType.success) {
                        field.onChange(parsedType.data);
                      }
                    }}
                  >
                    <SelectTrigger
                      size="sm"
                      aria-label={`Tipo de etapa de ${stage.name}`}
                      className={cn(
                        "w-28 rounded-full text-xs",
                        STAGE_TYPE_CLASS_NAMES[field.value],
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent align="end">
                      <SelectGroup>
                        {STAGE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={!canEditStages}
                aria-label={`Eliminar etapa ${stage.name}`}
                onClick={() => remove(index)}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ol>

        {typeof stageErrorMessage === "string" && (
          <p className="text-xs text-danger">{stageErrorMessage}</p>
        )}

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={!canEditStages}
          className="w-full border-border-strong border-dashed text-text-secondary"
          onClick={handleAddStage}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          Agregar etapa
        </Button>

        <Alert
          role="note"
          className="mt-1 border-0 bg-transparent px-0 text-text-secondary"
        >
          <Info aria-hidden="true" />
          <AlertDescription className="text-xs text-text-secondary">
            {canEditStages
              ? "Los cambios afectan solo a esta vacante. El flujo predeterminado se administra desde Configuración."
              : "El flujo de selección no puede modificarse porque la vacante ya fue abierta. Los demás datos permanecen disponibles para edición."}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
