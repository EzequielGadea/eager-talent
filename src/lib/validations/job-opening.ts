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

    if (normalizedStageNames.length > 0) {
      const firstStageName = normalizedStageNames[0];
      const lastStageName = normalizedStageNames.at(-1);

      if (firstStageName !== "aplicado") {
        ctx.addIssue({
          code: "custom",
          path: ["stages"],
          message: "Aplicado debe ser la primera etapa del flujo",
        });
      }

      if (!lastStageName?.startsWith("contratad")) {
        ctx.addIssue({
          code: "custom",
          path: ["stages"],
          message: "Contratado debe ser la última etapa del flujo",
        });
      }
    }

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
