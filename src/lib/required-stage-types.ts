const REQUIRED_STAGE_TYPES: Record<string, string> = {
  aplicado: "Ninguna",
  "entrevista hr": "Entrevista",
  "entrevista tecnica": "Entrevista",
  oferta: "Oferta",
  "contratado/a": "Contratado",
};

export function normalizeStageName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getRequiredStageType(name: string) {
  return REQUIRED_STAGE_TYPES[normalizeStageName(name)];
}

export function isRequiredStage(stage: { name: string; label: string }) {
  return Boolean(
    getRequiredStageType(stage.name) || getRequiredStageType(stage.label),
  );
}
