import { z } from "zod";

export const stageSchema = z.object({
  key: z.string(),
  name: z.string(),
  type: z.string(),
  color: z.string(),
  label: z.string(),
});

/*
[
  { "key": "revision-inicial", "name": "Revisión Inicial", "type": "Revision", "color": "blue", "label": "Revisión Inicial" },
  { "key": "entrevista-tecnica", "name": "Entrevista Técnica", "type": "Entrevista", "color": "purple", "label": "Entrevista Técnica" },
  { "key": "entrevista-cultural", "name": "Entrevista Cultural", "type": "Entrevista", "color": "orange", "label": "Entrevista Cultural" },
  { "key": "oferta", "name": "Oferta", "type": "Oferta", "color": "green", "label": "Oferta" }
]
*/

export type JobOpeningStage = z.infer<typeof stageSchema>;

// Valor que permite poder agendar entrevistas
export const INTERVIEW_STAGE_TYPE = "Entrevista";

export function stageAllowsInterview(
  stage: Pick<JobOpeningStage, "type"> | null | undefined,
) {
  return stage?.type === INTERVIEW_STAGE_TYPE;
}

// Convierte  Json de JobOpening.stages en array.
export function parseStages(json: unknown): JobOpeningStage[] {
  const result = z.array(stageSchema).safeParse(json);
  return result.success ? result.data : [];
}
