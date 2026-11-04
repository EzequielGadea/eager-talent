"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { Dispatch, SetStateAction } from "react";

import { PersistedStageFlowEditor } from "~/components/stage-flow-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { JobOpeningFormValues } from "./new-job-opening-form";
import type { Stages } from "../utils";

export default function OpeningStage(props: {
  stages: Stages;
  setStages: Dispatch<SetStateAction<Stages>>;
  requiredStageKeys: ReadonlySet<string>;
}) {
  const {
    setValue,
    formState: { errors, isSubmitted },
  } = useFormContext<JobOpeningFormValues>();

  // Keep the react-hook-form value in sync with the local stages state.
  useEffect(() => {
    setValue("stages", props.stages, { shouldValidate: isSubmitted });
  }, [props.stages, setValue, isSubmitted]);

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-baseline gap-2">
          <CardTitle className="font-heading text-h3 text-text-primary">
            Flujo del proceso
          </CardTitle>
          <CardDescription className="text-xs text-text-tertiary">
            arrastrá para reordenar
          </CardDescription>
        </div>
        {errors.stages && (
          <p className="text-xs whitespace-pre-line text-danger">
            {errors.stages?.message}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <PersistedStageFlowEditor
          stages={props.stages}
          onChange={props.setStages}
          lockedKeys={props.requiredStageKeys}
        />
      </CardContent>
    </Card>
  );
}
