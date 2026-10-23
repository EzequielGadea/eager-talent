import {
  FIRST_STAGE,
  LAST_STAGE,
  REQUIRED_MIDDLE_STAGES,
  normalizeStageName,
} from "~/lib/required-stage-types";

export function getRequiredStageErrors(
  stages: ReadonlyArray<{ name: string }>,
  normalizeName: (name: string) => string = normalizeStageName,
): string[] {
  const errors: string[] = [];
  const names = stages.map((stage) => normalizeName(stage.name));

  if (names[0] !== normalizeName(FIRST_STAGE)) {
    errors.push(`${FIRST_STAGE} debe ser la primera etapa del flujo.`);
  }

  if (names.at(-1) !== normalizeName(LAST_STAGE)) {
    errors.push(`${LAST_STAGE} debe ser la última etapa del flujo.`);
  }

  const middleNames = new Set(names.slice(1, -1));
  const missingStages = REQUIRED_MIDDLE_STAGES.filter(
    (name) => !middleNames.has(normalizeName(name)),
  );

  if (missingStages.length > 0) {
    errors.push(
      `Faltan etapas obligatorias en el flujo: ${missingStages.join(", ")}.`,
    );
  }

  return errors;
}
