import { JobOpeningStageType } from "~/lib/validations/job-opening";

export type Stages = Stage[];

export type Stage = {
  key: string;
  name: string;
  type: string;
  label: string;
  color: string;
};

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

export const mandatoryStages = [
  "Aplicado",
  "Oferta",
  "Entrevista HR",
  "Entrevista técnica",
  "Contrado/a",
];

export const STAGE_COLOR_CLASS_NAMES = [
  "bg-text-secondary",
  "bg-info",
  "bg-accent-purple",
  "bg-warning",
];

export const STAGE_TYPE_CLASS_NAMES: Record<JobOpeningStageType, string> = {
  none: "",
  interview: "bg-tag-blue-bg text-tag-blue-fg [&_svg]:text-tag-blue-fg",
  offer: "bg-tag-amber-bg text-tag-amber-fg [&_svg]:text-tag-amber-fg",
  hired: "bg-tag-green-bg text-tag-green-fg [&_svg]:text-tag-green-fg",
};

export const STAGE_TYPE_CLASS_STATIC: Record<JobOpeningStageType, string> = {
  none: "bg-muted",
  interview: "bg-tag-blue-blocked text-tag-blue-fg [&_svg]:text-tag-blue-fg",
  offer: "bg-tag-amber-blocked text-tag-amber-fg [&_svg]:text-tag-amber-fg",
  hired: "bg-tag-green-blocked text-tag-green-fg [&_svg]:text-tag-green-fg",
};