import { z } from "zod";

export const stageTargetDaysSchema = z
  .number({ error: "Ingresá la cantidad de días objetivo" })
  .int("Ingresá una cantidad entera de días")
  .min(1, "Debe ser al menos 1 día")
  .max(365, "No puede superar los 365 días");

export const stageTargetSchema = z.object({
  stageKey: z.string().min(1),
  targetDays: stageTargetDaysSchema,
});

export const stageTargetsSchema = z.array(stageTargetSchema);

export type StageTarget = z.infer<typeof stageTargetSchema>;

export const closeStageSchema = z.object({
  jobOpeningId: z.string().min(1),
  stageKey: z.string().min(1),
  closedAt: z.iso.date({ error: "Seleccioná una fecha de cierre válida" }),
});

export type CloseStageInput = z.infer<typeof closeStageSchema>;

export const reopenStageSchema = z.object({
  jobOpeningId: z.string().min(1),
  stageKey: z.string().min(1),
});

export const getStageMetricsSchema = z.object({
  jobOpeningId: z.string().min(1),
});
