"use client";

import { GripVertical, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

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
import { api } from "~/lib/trpc/react";

type DefaultStage = {
  key: string;
  name: string;
  type: string;
  label: string;
  color: string;
};

const REQUIRED_MIDDLE_STAGES = [
  "Entrevista HR",
  "Entrevista Técnica",
  "Oferta",
];

const REQUIRED_STAGE_TYPES: Record<string, string> = {
  "entrevista hr": "Entrevista",
  "entrevista tecnica": "Entrevista",
  oferta: "Oferta",
};

const STAGE_TYPE_OPTIONS = [
  { value: "Ninguna", label: "Ninguna" },
  { value: "Entrevista", label: "Entrevista" },
  { value: "Oferta", label: "Oferta" },
  { value: "Contratado", label: "Contratado" },
];

const STAGE_COLORS = ["#64748B", "#3B82F6", "#F59E0B", "#22C55E"];

function isBoundaryStage(index: number, total: number) {
  return index === 0 || index === total - 1;
}

function normalizeStageName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getRequiredStageType(name: string) {
  return REQUIRED_STAGE_TYPES[normalizeStageName(name)];
}

export default function DefaultStageSetting() {
  const { data, isLoading } = api.templateStages.getDefault.useQuery();
  const [stages, setStages] = useState<DefaultStage[]>([]);
  const [savedStages, setSavedStages] = useState<DefaultStage[]>([]);

  const updateDefault = api.templateStages.updateDefault.useMutation({
    onSuccess: () => {
      setSavedStages(stages.map((stage) => ({ ...stage })));
      toast.add({ title: "Flujo predeterminado actualizado", type: "success" });
    },
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
  });

  useEffect(() => {
    if (!data) return;

    const nextStages = data.stages.map((stage) => ({ ...stage }));
    setStages(nextStages);
    setSavedStages(nextStages);
  }, [data]);

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
        {isLoading && (
          <p className="py-4 text-sm text-text-tertiary">Cargando etapas...</p>
        )}

        {!isLoading && (
          <ol aria-live="polite" className="flex flex-col gap-2">
            {stages.map((stage, index) => {
              const locked = isBoundaryStage(index, stages.length);
              const normalizedStageName = normalizeStageName(stage.name);
              const isRequired = REQUIRED_MIDDLE_STAGES.some(
                (requiredStage) =>
                  normalizeStageName(requiredStage) === normalizedStageName,
              );

              return (
                <li
                  key={stage.key}
                  className="flex items-center gap-2.5 rounded-lg border border-border-default px-2 py-2"
                  onDragOver={(event) => {
                    if (!locked) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    moveStage(
                      Number(event.dataTransfer.getData("text/plain")),
                      index,
                    );
                  }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    draggable={!locked}
                    disabled={locked}
                    aria-label={
                      locked
                        ? `${stage.name} es una etapa fija`
                        : `Reordenar etapa ${stage.name}`
                    }
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(index));
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
                    <GripVertical aria-hidden="true" />
                  </Button>
                  <span className="w-3.5 text-center font-mono text-[11px] text-text-tertiary">
                    {index + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <Input
                    aria-label={`Nombre de la etapa ${index + 1}`}
                    placeholder="Nombre de la etapa"
                    value={stage.name}
                    readOnly={locked}
                    maxLength={80}
                    className="h-7 min-w-0 flex-1 border-transparent bg-transparent px-1 font-medium shadow-none"
                    onChange={(event) => {
                      const name = event.target.value;
                      const requiredType = getRequiredStageType(name);

                      updateStage(stage.key, {
                        name,
                        ...(requiredType ? { type: requiredType } : {}),
                      });
                    }}
                  />
                  <Select
                    value={stage.type || undefined}
                    items={STAGE_TYPE_OPTIONS}
                    disabled={locked || isRequired}
                    onValueChange={(value: string | null) => {
                      if (value) updateStage(stage.key, { type: value });
                    }}
                  >
                    <SelectTrigger
                      size="sm"
                      aria-label={`Tipo de etapa de ${stage.name}`}
                      className="w-28 rounded-full text-xs"
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
        )}

        <button
          type="button"
          disabled={isLoading}
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
