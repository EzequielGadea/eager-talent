import { PersistedStage } from "~/lib/validations/job-opening";

export type Stages = Stage[];

export type Stage = PersistedStage;

export type Template = { id: string; stages: Stages };

export function hasDuplicatedNames(data: Stages): boolean {
  const set = new Set<string>();
  data.forEach((stage) => {
    //Elimina multiples espacios consecutivos
    const trimmed = stage.name
      .split(" ")
      .filter((word) => word !== "")
      .join(" ");
    set.add(trimmed);
  });
  return data.length > set.size;
}

export const STAGE_COLOR_CLASS_NAMES = [
  "bg-text-secondary",
  "bg-info",
  "bg-accent-purple",
  "bg-warning",
];
