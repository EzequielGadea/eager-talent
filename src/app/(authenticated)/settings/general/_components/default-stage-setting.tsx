"use client";

import { GripVertical, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/components/ui/toast";
import {
  ColorPicker,
  ColorPickerHex,
  ColorPickerInput,
} from "~/components/ui/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  getRequiredStageType,
  isRequiredStage,
} from "~/lib/required-stage-types";
import { api } from "~/lib/trpc/react";
import { GeneralSettingsCardSkeleton } from "./general-settings-card-skeleton";
import { SettingsFetchError } from "./settings-fetch-error";

import {
  persistedStageTypeSchema,
  type PersistedStage,
} from "~/lib/validations/job-opening";

type DefaultStage = PersistedStage;

const STAGE_TYPE_OPTIONS = [
  { value: "Ninguna", label: "Ninguna" },
  { value: "Entrevista", label: "Entrevista" },
  { value: "Oferta", label: "Oferta" },
  { value: "Contratado", label: "Contratado" },
];

const STAGE_COLORS = ["#64748B", "#3B82F6", "#F59E0B", "#22C55E"];
const STAGE_DRAG_TYPE = "application/x-default-stage-index";

function isBoundaryStage(index: number, total: number) {
  return index === 0 || index === total - 1;
}

export default function DefaultStageSetting() {
  const {
    data: flujo,
    isLoading: isFlujoLoading,
    isError,
    refetch,
    isFetching,
  } = api.templateStages.getDefault.useQuery();

  if (isFlujoLoading) {
    return (
      <GeneralSettingsCardSkeleton
        title="Flujo por defecto"
        rows={3}
        showActionButton={false}
      />
    );
  }

  if (isError || !flujo) {
    return (
      <SettingsFetchError
        title="Flujo por defecto"
        refetch={refetch}
        isFetching={isFetching}
      />
    );
  }

  const requiredStageIds = new Set(
    flujo.stages.flatMap((stage) =>
      isRequiredStage(stage) ? [stage.key] : [],
    ),
  );

  return (
    <DefaultStageEditor
      key={JSON.stringify(flujo.stages)}
      data={flujo}
      requiredStageIds={requiredStageIds}
    />
  );
}

function DefaultStageEditor({
  data,
  requiredStageIds,
}: {
  data: { id: string; stages: DefaultStage[] };
  requiredStageIds: ReadonlySet<string>;
}) {
  const initialStages = data.stages.map((stage) => ({ ...stage }));
  const [stages, setStages] = useState<DefaultStage[]>(initialStages);
  const [savedStages, setSavedStages] = useState<DefaultStage[]>(initialStages);
  const [openColor, setOpenColor] = useState<string | null>(null);

  const updateDefault = api.templateStages.updateDefault.useMutation({
    onSuccess: () => {
      setSavedStages(stages.map((stage) => ({ ...stage })));
      toast.add({ title: "Flujo predeterminado actualizado", type: "success" });
    },
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
  });

  const hasChanges = JSON.stringify(stages) !== JSON.stringify(savedStages);

  function updateStage(key: string, changes: Partial<DefaultStage>) {
    setStages((current) =>
      current.map((stage) =>
        stage.key === key ? { ...stage, ...changes } : stage,
      ),
    );
  }

  function moveStage(fromIndex: number, toIndex: number) {
    if (
      !Number.isInteger(fromIndex) ||
      !Number.isInteger(toIndex) ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= stages.length ||
      toIndex >= stages.length ||
      isBoundaryStage(fromIndex, stages.length) ||
      isBoundaryStage(toIndex, stages.length)
    ) {
      return;
    }

    setStages((current) => {
      const next = [...current];
      const [stage] = next.splice(fromIndex, 1);
      if (stage) next.splice(toIndex, 0, stage);
      return next;
    });
  }

  function addStage() {
    setStages((current) => [
      ...current.slice(0, -1),
      {
        key: crypto.randomUUID(),
        name: "",
        type: "Ninguna",
        label: "text",
        color: STAGE_COLORS[current.length % STAGE_COLORS.length] ?? "#64748B",
      },
      ...current.slice(-1),
    ]);
  }

  function removeStage(key: string) {
    setStages((current) => current.filter((stage) => stage.key !== key));
  }

  function handleSave() {
    if (!data || !hasChanges) return;

    if (stages.some((stage) => !stage.name.trim())) {
      toast.add({
        title: "Todas las etapas deben tener un nombre.",
        type: "error",
      });
      return;
    }

    const normalizedNames = stages.map((stage) =>
      stage.name.trim().toLocaleLowerCase("es"),
    );
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      toast.add({
        title: "No puede haber etapas con el mismo nombre.",
        type: "error",
      });
      return;
    }

    updateDefault.mutate({ id: data.id, stages });
  }

  function handleCancel() {
    setStages(savedStages.map((stage) => ({ ...stage })));
  }

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-baseline gap-2">
          <CardTitle className="text-sm font-semibold">
            Flujo por defecto
          </CardTitle>
          <span className="text-xs text-text-tertiary">
            {hasChanges ? "hay cambios sin guardar" : ""}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <ol aria-live="polite" className="flex flex-col gap-2">
          {stages.map((stage, index) => {
            const locked = isBoundaryStage(index, stages.length);
            const isRequired = requiredStageIds.has(stage.key);

            return (
              <li
                key={stage.key}
                className="grid grid-cols-[auto_auto_auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-border-default px-2 py-2 md:grid-cols-[auto_auto_auto_minmax(0,1fr)_auto_auto]"
                onDragOver={(event) => {
                  if (
                    !locked &&
                    event.dataTransfer.types.includes(STAGE_DRAG_TYPE)
                  ) {
                    event.preventDefault();
                  }
                }}
                onDrop={(event) => {
                  if (!event.dataTransfer.types.includes(STAGE_DRAG_TYPE)) {
                    return;
                  }

                  event.preventDefault();
                  if (locked) return;

                  moveStage(
                    Number(event.dataTransfer.getData(STAGE_DRAG_TYPE)),
                    index,
                  );
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="max-md:size-9"
                  draggable={!locked}
                  disabled={locked}
                  aria-label={
                    locked
                      ? `${stage.name} es una etapa fija`
                      : `Reordenar etapa ${stage.name}`
                  }
                  onDragStart={(event) => {
                    if (locked) {
                      event.preventDefault();
                      return;
                    }

                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData(STAGE_DRAG_TYPE, String(index));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveStage(index, index - 1);
                    }
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveStage(index, index + 1);
                    }
                  }}
                >
                  <GripVertical
                    aria-hidden="true"
                    className="size-5 md:size-3"
                  />
                </Button>
                <span className="w-3.5 text-center font-mono text-[11px] text-text-tertiary">
                  {index + 1}
                </span>
                <Popover
                  open={openColor === stage.key}
                  onOpenChange={(open) => setOpenColor(open ? stage.key : null)}
                >
                  <PopoverTrigger
                    type="button"
                    className="size-4 shrink-0 cursor-pointer rounded-full border border-border-default p-0"
                    style={{ backgroundColor: stage.color }}
                    aria-label={`Elegir color para ${stage.name}`}
                  />
                  <PopoverContent align="start" className="w-56 rounded-xl p-3">
                    <ColorPicker>
                      <ColorPickerHex
                        color={stage.color}
                        onChange={(color) => updateStage(stage.key, { color })}
                      />
                      <ColorPickerInput
                        type="text"
                        aria-label={`Código de color para ${stage.name}`}
                        value={stage.color}
                        onChange={(event) =>
                          updateStage(stage.key, { color: event.target.value })
                        }
                      />
                    </ColorPicker>
                  </PopoverContent>
                </Popover>
                <div className="min-w-0 flex-1">
                  <Input
                    aria-label={`Nombre de la etapa ${index + 1}`}
                    placeholder="Nombre de la etapa"
                    value={stage.name}
                    readOnly={locked || isRequired}
                    disabled={index === 0 || index === stages.length - 1}
                    maxLength={80}
                    className="h-7 w-full border-transparent bg-transparent px-1 font-medium shadow-none"
                    onChange={(event) => {
                      const name = event.target.value;
                      const requiredType = persistedStageTypeSchema.safeParse(
                        getRequiredStageType(name),
                      );
                      updateStage(stage.key, {
                        name,
                        ...(requiredType.success
                          ? { type: requiredType.data }
                          : {}),
                      });
                    }}
                  />
                </div>
                <Select
                  value={stage.type || undefined}
                  items={STAGE_TYPE_OPTIONS}
                  disabled={locked || isRequired}
                  onValueChange={(value: string | null) => {
                    const result = persistedStageTypeSchema.safeParse(value);

                    if (!result.success) return;

                    updateStage(stage.key, { type: result.data });
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label={`Tipo de etapa de ${stage.name}`}
                    className="col-start-4 row-start-2 w-full min-w-0 rounded-full text-xs md:col-start-auto md:row-start-auto md:w-28"
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
                <Button
                  className="col-start-5 row-start-1 md:col-start-auto md:row-start-auto"
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={locked || isRequired}
                  aria-label={
                    locked || isRequired
                      ? `No se puede eliminar la etapa ${stage.name}`
                      : `Eliminar etapa ${stage.name}`
                  }
                  onClick={() => removeStage(stage.key)}
                >
                  <X aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover"
          onClick={addStage}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar etapa
        </button>

        {hasChanges && (
          <div className="flex justify-end gap-2 border-t border-border-default pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={updateDefault.isPending}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={updateDefault.isPending}
              onClick={handleSave}
            >
              {updateDefault.isPending ? "Guardando..." : "Aceptar"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
