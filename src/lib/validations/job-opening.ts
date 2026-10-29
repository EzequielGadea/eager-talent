import { z } from "zod";

import { JobOpeningStatus } from "~/generated/prisma/enums";
import {
  FIRST_STAGE,
  LAST_STAGE,
  REQUIRED_MIDDLE_STAGES,
} from "~/lib/required-stage-types";
import { getRequiredStageErrors } from "~/lib/validations/required-stages";

export const jobOpeningStageTypeSchema = z.enum([
  "none",
  "interview",
  "offer",
  "hired",
]);

export type JobOpeningStageType = z.infer<typeof jobOpeningStageTypeSchema>;

// Stage types as stored in JobOpening.stages.
export const persistedStageTypeSchema = z.enum([
  "Ninguna",
  "Entrevista",
  "Oferta",
  "Contratado",
]);

export type PersistedStageType = z.infer<typeof persistedStageTypeSchema>;

// Stage format stored in JobOpening.stages (and StageTemplate.stages).
export const persistedStageSchema = z.object({
  key: z.string().min(1),
  name: z.string(),
  type: persistedStageTypeSchema,
  color: z.string(),
  label: z.string(),
});

export const persistedStagesSchema = z
  .array(persistedStageSchema)
  .superRefine((stages, ctx) => {
    const stageKeys = stages.map((stage) => stage.key);

    if (new Set(stageKeys).size !== stageKeys.length) {
      ctx.addIssue({
        code: "custom",
        path: [],
        message: "Las etapas no pueden tener identificadores repetidos",
      });
    }
  });

export type PersistedStage = z.infer<typeof persistedStageSchema>;

export const PERSISTED_TO_FORM_STAGE_TYPE: Record<
  PersistedStageType,
  JobOpeningStageType
> = {
  Ninguna: "none",
  Entrevista: "interview",
  Oferta: "offer",
  Contratado: "hired",
};

export const FORM_TO_PERSISTED_STAGE_TYPE: Record<
  JobOpeningStageType,
  PersistedStageType
> = {
  none: "Ninguna",
  interview: "Entrevista",
  offer: "Oferta",
  hired: "Contratado",
};

export const INTERVIEW_STAGE_TYPE = "Entrevista" satisfies PersistedStageType;

export function stageAllowsInterview(
  stage: Pick<PersistedStage, "type"> | null | undefined,
) {
  return stage?.type === INTERVIEW_STAGE_TYPE;
}

// Parses the JobOpening.stages Json; returns [] if it doesn't match the schema.
export function parseStages(json: unknown): PersistedStage[] {
  const result = persistedStagesSchema.safeParse(json);
  return result.success ? result.data : [];
}

export const jobOpeningStageSchema = z.object({
  id: z.string().min(1, "La etapa debe tener un identificador"),

  name: z
    .string()
    .trim()
    .min(1, "El nombre de la etapa es obligatorio")
    .max(80, "El nombre de la etapa no puede superar 80 caracteres"),

  type: jobOpeningStageTypeSchema,

  color: z.string().trim().min(1, "El color es obligatorio").max(32),
});

export const updateJobOpeningSchema = z
  .object({
    id: z.string().min(1, "La vacante es obligatoria"),

    name: z
      .string()
      .trim()
      .min(1, "El nombre de la vacante es obligatorio")
      .max(160, "El nombre no puede superar 160 caracteres"),

    // Opcional: si no se envía, la vacante conserva su estado actual.
    status: z.enum(JobOpeningStatus).optional(),

    areaId: z.string().min(1, "El área es obligatoria"),

    seniorityIds: z
      .array(z.string().min(1))
      .min(1, "Seleccioná al menos un seniority"),

    // Opcional: si no se envía, la vacante conserva su ubicación actual.
    location: z.enum(["Uruguay", "Argentina", "Indiferente"]).optional(),

    openingDate: z.iso.date({
      error: "La fecha de apertura no es válida",
    }),

    targetClosingDate: z.iso.date({
      error: "La fecha objetivo de cierre no es válida",
    }),

    stages: z
      .array(jobOpeningStageSchema)
      .min(1, "La vacante debe tener al menos una etapa"),

    hiringManagerIds: z.array(z.string().min(1)),
  })
  .superRefine((data, ctx) => {
    const openingDate = new Date(`${data.openingDate}T00:00:00.000Z`);
    const targetClosingDate = new Date(
      `${data.targetClosingDate}T00:00:00.000Z`,
    );

    const stageIds = data.stages.map((stage) => stage.id);

    if (new Set(stageIds).size !== stageIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["stages"],
        message: "Las etapas no pueden tener identificadores repetidos",
      });
    }

    if (targetClosingDate < openingDate) {
      ctx.addIssue({
        code: "custom",
        path: ["targetClosingDate"],
        message:
          "La fecha objetivo de cierre no puede ser anterior a la apertura",
      });
    }

    const normalizedStageNames = data.stages.map((stage) =>
      stage.name.toLocaleLowerCase("es"),
    );

    if (new Set(normalizedStageNames).size !== normalizedStageNames.length) {
      ctx.addIssue({
        code: "custom",
        path: ["stages"],
        message: "Las etapas no pueden tener nombres repetidos",
      });
    }

    // The required stages rule (addRequiredStagesIssues) only applies when the
    // stages change, so job openings with an older flow can save other data.

    if (new Set(data.seniorityIds).size !== data.seniorityIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["seniorityIds"],
        message: "Los seniorities no pueden estar repetidos",
      });
    }

    if (new Set(data.hiringManagerIds).size !== data.hiringManagerIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["hiringManagerIds"],
        message: "Los Hiring Managers no pueden estar repetidos",
      });
    }
  });

export type UpdateJobOpeningInput = z.infer<typeof updateJobOpeningSchema>;

type JobOpeningStage = z.infer<typeof jobOpeningStageSchema>;

// Lo que define la estructura del flujo. El color no cuenta como cambio de flujo.
type JobOpeningStageIdentity = Pick<JobOpeningStage, "id" | "name" | "type">;

function normalizeStageName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}

const REQUIRED_STAGE_NAMES = new Set(
  [FIRST_STAGE, ...REQUIRED_MIDDLE_STAGES, LAST_STAGE].map(normalizeStageName),
);

export function isRequiredStageName(name: string) {
  return REQUIRED_STAGE_NAMES.has(normalizeStageName(name));
}

export function jobOpeningStagesChanged(
  currentStages: JobOpeningStageIdentity[],
  nextStages: JobOpeningStageIdentity[],
) {
  if (currentStages.length !== nextStages.length) {
    return true;
  }

  return currentStages.some((currentStage, index) => {
    const nextStage = nextStages[index];

    return (
      !nextStage ||
      currentStage.id !== nextStage.id ||
      currentStage.name !== nextStage.name ||
      currentStage.type !== nextStage.type
    );
  });
}

export function addRequiredStagesIssues(
  stages: JobOpeningStage[],
  ctx: z.RefinementCtx,
) {
  for (const message of getRequiredStageErrors(stages, normalizeStageName)) {
    ctx.addIssue({
      code: "custom",
      path: ["stages"],
      message,
    });
  }
}

// Edit form: the API schema plus the required stages rule once the user
// changes the stages loaded with the job opening.
export function getUpdateJobOpeningFormSchema(
  initialStages: JobOpeningStage[],
) {
  return updateJobOpeningSchema.superRefine((data, ctx) => {
    if (jobOpeningStagesChanged(initialStages, data.stages)) {
      addRequiredStagesIssues(data.stages, ctx);
    }
  });
}
