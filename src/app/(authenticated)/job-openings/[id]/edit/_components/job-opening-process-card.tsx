"use client";

import { Info } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
  isRequiredStageName,
  type UpdateJobOpeningInput,
} from "~/lib/validations/job-opening";

import {
  StageFlowEditor,
  type StageFlowItem,
} from "~/components/stage-flow-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { StageTargetDaysFields } from "../../../_components/stage-target-days-fields";

type JobOpeningProcessCardProps = {
  canEditStages: boolean;
};

export function JobOpeningProcessCard({
  canEditStages,
}: JobOpeningProcessCardProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors, defaultValues, isSubmitted },
  } = useFormContext<UpdateJobOpeningInput>();

  // Required stages as loaded (Aplicado, Entrevista HR, Entrevista Técnica,
  // Oferta, Contratado/a), by id so typing one of those names in a new stage
  // does not lock it.
  const requiredStageIds = new Set(
    (defaultValues?.stages ?? []).flatMap((stage) =>
      stage?.id && stage.name && isRequiredStageName(stage.name)
        ? [stage.id]
        : [],
    ),
  );

  const { insert, remove, move } = useFieldArray({
    control,
    name: "stages",
    keyName: "fieldKey",
  });
  const watchedStages = useWatch({ control, name: "stages" });

  const stages: StageFlowItem[] = (watchedStages ?? []).map((stage) => ({
    id: stage.id,
    name: stage.name,
    type: stage.type,
    color: stage.color,
  }));

  const stageErrorMessage =
    typeof errors.stages?.message === "string"
      ? errors.stages.message
      : errors.stages?.root?.message;

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-baseline gap-2">
          <CardTitle className="font-heading text-h3 text-text-primary">
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
        <StageFlowEditor
          stages={stages}
          lockedIds={requiredStageIds}
          disabled={!canEditStages}
          getNameError={(index) => errors.stages?.[index]?.name?.message}
          onUpdate={(index, changes) => {
            const options = { shouldDirty: true, shouldValidate: isSubmitted };

            if (changes.name !== undefined) {
              setValue(`stages.${index}.name`, changes.name, options);
            }
            if (changes.type !== undefined) {
              setValue(`stages.${index}.type`, changes.type, options);
            }
            if (changes.color !== undefined) {
              setValue(`stages.${index}.color`, changes.color, options);
            }
          }}
          onInsert={insert}
          onRemove={remove}
          onMove={move}
        />

        {typeof stageErrorMessage === "string" && (
          <p className="text-xs text-danger">{stageErrorMessage}</p>
        )}

        {/* Target days stay editable even when the flow is locked. */}
        <StageTargetDaysFields
          fields={(defaultValues?.stageTargets ?? []).flatMap(
            (target, index) =>
              target?.stageKey
                ? [
                    {
                      stageKey: target.stageKey,
                      stageName:
                        stages.find((stage) => stage.id === target.stageKey)
                          ?.name ?? target.stageKey,
                      error: errors.stageTargets?.[index]?.targetDays?.message,
                      inputProps: register(`stageTargets.${index}.targetDays`, {
                        valueAsNumber: true,
                      }),
                    },
                  ]
                : [],
          )}
        />

        <div
          role="note"
          className="mt-1 flex items-center justify-center gap-2 text-center text-xs leading-4 text-text-secondary"
        >
          <Info aria-hidden="true" className="size-4 shrink-0" />
          <p>
            {canEditStages
              ? "Los cambios afectan solo a esta vacante. El flujo predeterminado se administra desde Configuración."
              : "El flujo de selección no puede modificarse porque la vacante ya fue abierta. Los demás datos permanecen disponibles para edición."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
