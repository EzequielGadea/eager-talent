"use client";

import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PersistedStageFlowEditor } from "~/components/stage-flow-editor";
import { toast } from "~/components/ui/toast";
import { isRequiredStage } from "~/lib/required-stage-types";
import { api } from "~/lib/trpc/react";
import { GeneralSettingsCardSkeleton } from "./general-settings-card-skeleton";
import { SettingsFetchError } from "./settings-fetch-error";

import { type PersistedStage } from "~/lib/validations/job-opening";

type DefaultStage = PersistedStage;

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
          <CardTitle>Flujo por defecto</CardTitle>
          <span className="text-xs text-text-tertiary">
            {hasChanges ? "hay cambios sin guardar" : "arrastrá para reordenar"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <PersistedStageFlowEditor
          stages={stages}
          onChange={setStages}
          lockedKeys={requiredStageIds}
        />

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
