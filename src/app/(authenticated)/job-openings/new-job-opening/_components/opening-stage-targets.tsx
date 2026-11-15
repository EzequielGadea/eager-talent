"use client";

import { useFormContext } from "react-hook-form";

import { StageTargetDaysFields } from "../../_components/stage-target-days-fields";
import type { JobOpeningFormValues } from "./new-job-opening-form";
import type { Stages } from "../utils";

export default function OpeningStageTargets(props: { stages: Stages }) {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

  const fields = getValues("metricStageTargets").map((target, index) => ({
    stageKey: target.stageKey,
    stageName:
      props.stages.find((stage) => stage.key === target.stageKey)?.name ??
      target.stageKey,
    error: errors.metricStageTargets?.[index]?.targetDays?.message,
    inputProps: register(`metricStageTargets.${index}.targetDays`, {
      valueAsNumber: true,
    }),
  }));

  return <StageTargetDaysFields fields={fields} />;
}
