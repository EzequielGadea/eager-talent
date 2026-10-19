import { parseStages } from "~/lib/validations/job-opening";

// Application interviews are named after their stage; exploratory ones carry their own name.
export function getInterviewName(
  interview: { exploratoryName: string | null; stageId: string | null },
  stagesJson: unknown,
) {
  if (interview.exploratoryName) return interview.exploratoryName;

  const stage = parseStages(stagesJson).find(
    (candidate) => candidate.key === interview.stageId,
  );
  return stage?.name ?? "Entrevista";
}

export function getStageName(stagesJson: unknown, stageId: string | null) {
  if (!stageId) return null;

  return (
    parseStages(stagesJson).find((stage) => stage.key === stageId)?.name ?? null
  );
}
