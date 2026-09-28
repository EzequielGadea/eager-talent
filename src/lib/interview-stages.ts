export const INTERVIEW_STAGE_TYPES = [
  "Entrevista Técnica",
  "Entrevista HR",
  "Entrevista Cultural",
  "Psicotécnico",
];

export function stageAllowsInterview(stageTYPE: string) {
  return INTERVIEW_STAGE_TYPES.includes(stageTYPE);
}

/*
const INTERVIEW_STAGE_TYPE = "Entrevista";

export function stageAllowsInterview(stageType: string) {
  return stageType === INTERVIEW_STAGE_TYPE;
}
*/
