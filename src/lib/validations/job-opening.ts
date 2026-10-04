import { z } from "zod";

import { JobOpeningStatus } from "~/generated/prisma/enums";

export const jobOpeningStageTypeSchema = z.enum([
  "none",
  "interview",
  "offer",
  "hired",
]);

export type JobOpeningStageType = z.infer<typeof jobOpeningStageTypeSchema>;

export const jobOpeningStageSchema = z.object({
  id: z.string().min(1, "La etapa debe tener un identificador"),

  name: z
    .string()
    .trim()
    .min(1, "El nombre de la etapa es obligatorio")
    .max(80, "El nombre de la etapa no puede superar 80 caracteres"),

  type: jobOpeningStageTypeSchema,
});

export const updateJobOpeningSchema = z
  .object({
    id: z.string().min(1, "La vacante es obligatoria"),

    name: z
      .string()
      .trim()
      .min(1, "El nombre de la vacante es obligatorio")
      .max(160, "El nombre no puede superar 160 caracteres"),

    status: z.enum(JobOpeningStatus),

    areaId: z.string().min(1, "El área es obligatoria"),

    seniorityIds: z
      .array(z.string().min(1))
      .min(1, "Seleccioná al menos un seniority"),

    location: z.enum(["Uruguay", "Argentina", "Indiferente"]),

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

const FIRST_STAGE = "Aplicado";
const LAST_STAGE = "Contratado/a";
// Required between the first and last stages, in any order.
const REQUIRED_MIDDLE_STAGES = [
  "Entrevista HR",
  "Entrevista Técnica",
  "Oferta",
];

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
  currentStages: JobOpeningStage[],
  nextStages: JobOpeningStage[],
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
  const stageNames = stages.map((stage) => normalizeStageName(stage.name));

  if (stageNames[0] !== normalizeStageName(FIRST_STAGE)) {
    ctx.addIssue({
      code: "custom",
      path: ["stages"],
      message: `${FIRST_STAGE} debe ser la primera etapa del flujo`,
    });
  }

  if (stageNames.at(-1) !== normalizeStageName(LAST_STAGE)) {
    ctx.addIssue({
      code: "custom",
      path: ["stages"],
      message: `${LAST_STAGE} debe ser la última etapa del flujo`,
    });
  }

  const middleStageNames = new Set(stageNames.slice(1, -1));
  const missingStages = REQUIRED_MIDDLE_STAGES.filter(
    (stageName) => !middleStageNames.has(normalizeStageName(stageName)),
  );

  if (missingStages.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["stages"],
      message: `Faltan etapas obligatorias en el flujo: ${missingStages.join(", ")}`,
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
