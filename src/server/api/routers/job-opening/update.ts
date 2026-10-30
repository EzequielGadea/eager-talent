import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import {
  addRequiredStagesIssues,
  FORM_TO_PERSISTED_STAGE_TYPE,
  isRequiredStageName,
  jobOpeningStagesChanged,
  jobOpeningStageSchema,
  jobOpeningStageTypeSchema,
  PERSISTED_TO_FORM_STAGE_TYPE,
  persistedStageTypeSchema,
  updateJobOpeningSchema,
  type JobOpeningStageType,
} from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";

type CurrentStage = {
  id: string;
  name: string;
  type: JobOpeningStageType;
};

type InputStage = z.infer<typeof jobOpeningStageSchema>;

function getStageId(stageRecord: Record<string, unknown>, index: number) {
  if (typeof stageRecord.id === "string" && stageRecord.id !== "") {
    return stageRecord.id;
  }

  if (typeof stageRecord.key === "string" && stageRecord.key !== "") {
    return stageRecord.key;
  }

  return `stage-${index}`;
}

function inferStageType(name: string): JobOpeningStageType {
  const normalizedName = name.toLocaleLowerCase("es");

  if (normalizedName.includes("contratad")) {
    return "hired";
  }

  if (normalizedName.includes("oferta") || normalizedName.includes("ofertad")) {
    return "offer";
  }

  if (normalizedName.includes("entrevista")) {
    return "interview";
  }

  return "none";
}

function getCurrentStages(value: unknown): CurrentStage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((stage, index) => {
    if (typeof stage !== "object" || stage === null || Array.isArray(stage)) {
      return [];
    }

    const stageRecord = stage as Record<string, unknown>;

    if (
      typeof stageRecord.name !== "string" ||
      stageRecord.name.trim() === ""
    ) {
      return [];
    }

    const name = stageRecord.name.trim();
    const parsedPersistedType = persistedStageTypeSchema.safeParse(
      stageRecord.type,
    );
    const parsedType = jobOpeningStageTypeSchema.safeParse(stageRecord.type);

    const type = parsedPersistedType.success
      ? PERSISTED_TO_FORM_STAGE_TYPE[parsedPersistedType.data]
      : parsedType.success
        ? parsedType.data
        : inferStageType(name);

    return [
      {
        id: getStageId(stageRecord, index),
        name,
        type,
      },
    ];
  });
}

function getPersistedStagesById(value: unknown) {
  const stagesById = new Map<string, Record<string, unknown>>();

  if (!Array.isArray(value)) {
    return stagesById;
  }

  value.forEach((stage: unknown, index) => {
    if (typeof stage === "object" && stage !== null && !Array.isArray(stage)) {
      const stageRecord = stage as Record<string, unknown>;
      stagesById.set(getStageId(stageRecord, index), stageRecord);
    }
  });

  return stagesById;
}

// Existing stages keep all their fields (key, color, label...); only the
// edited values change. New stages are created in the same format.
function toPersistedStage(
  stage: InputStage,
  persistedStage: Record<string, unknown> | undefined,
) {
  const type = FORM_TO_PERSISTED_STAGE_TYPE[stage.type];

  if (!persistedStage) {
    return {
      key: stage.id,
      name: stage.name,
      type,
      color: stage.color,
      label: stage.name,
    };
  }

  const renamed = persistedStage.name !== stage.name;

  return {
    ...persistedStage,
    key:
      typeof persistedStage.key === "string" && persistedStage.key !== ""
        ? persistedStage.key
        : stage.id,
    name: stage.name,
    type,
    color: stage.color,
    label:
      renamed || typeof persistedStage.label !== "string"
        ? stage.name
        : persistedStage.label,
  };
}

const requiredStagesSchema = z
  .array(jobOpeningStageSchema)
  .superRefine(addRequiredStagesIssues);

export const updateJobOpening = protectedProcedure
  .input(updateJobOpeningSchema)
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          jobOpening: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar la vacante",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No hay una organización activa",
      });
    }

    const [
      currentJobOpening,
      area,
      validSeniorityCount,
      validHiringManagerCount,
    ] = await Promise.all([
      ctx.db.jobOpening.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          status: true,
          hasBeenOpened: true,
          openingDate: true,
          stages: true,
          applications: {
            where: { deletedAt: null },
            select: {
              currentStageId: true,
            },
          },
        },
      }),

      ctx.db.area.findFirst({
        where: {
          id: input.areaId,
        },
        select: {
          id: true,
        },
      }),

      ctx.db.seniority.count({
        where: {
          id: {
            in: input.seniorityIds,
          },
        },
      }),

      ctx.db.member.count({
        where: {
          organizationId,
          role: "hiringManager",
          userId: {
            in: input.hiringManagerIds,
          },
          user: {
            banned: false,
          },
        },
      }),
    ]);

    if (!currentJobOpening) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vacante no encontrada",
      });
    }

    if (
      currentJobOpening.status === "Closed" ||
      currentJobOpening.status === "Cancelled"
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No se puede modificar una vacante cerrada o cancelada",
      });
    }

    if (!area) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "El área seleccionada no existe",
      });
    }

    if (validSeniorityCount !== input.seniorityIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Uno o más seniorities no son válidos",
      });
    }

    if (validHiringManagerCount !== input.hiringManagerIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Uno o más Hiring Managers no son válidos",
      });
    }

    const persistedOpeningDate = new Date(
      Date.UTC(
        currentJobOpening.openingDate.getUTCFullYear(),
        currentJobOpening.openingDate.getUTCMonth(),
        currentJobOpening.openingDate.getUTCDate(),
      ),
    );
    const nextTargetClosingDate = new Date(
      `${input.targetClosingDate}T00:00:00.000Z`,
    );

    if (nextTargetClosingDate < persistedOpeningDate) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "La fecha objetivo de cierre no puede ser anterior a la apertura",
      });
    }

    const currentStages = getCurrentStages(currentJobOpening.stages);
    const persistedStagesById = getPersistedStagesById(
      currentJobOpening.stages,
    );
    const stagesChanged = jobOpeningStagesChanged(currentStages, input.stages);
    // Cambiar solo el color se permite siempre, incluso con la vacante abierta.
    const colorsChanged = input.stages.some(
      (stage) => persistedStagesById.get(stage.id)?.color !== stage.color,
    );
    // Estado y ubicación son opcionales: si no llegan, se conservan.
    const nextStatus = input.status ?? currentJobOpening.status;
    const hasBeenOpened =
      currentJobOpening.hasBeenOpened || currentJobOpening.status === "Open";
    if (hasBeenOpened && stagesChanged) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "No se puede modificar el flujo mientras la vacante está abierta",
      });
    }

    if (stagesChanged) {
      const requiredStagesResult = requiredStagesSchema.safeParse(input.stages);

      if (!requiredStagesResult.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            requiredStagesResult.error.issues[0]?.message ??
            "El flujo de etapas no es válido",
        });
      }

      const retypedRequiredStage = currentStages.find((currentStage) => {
        const nextStage = input.stages.find(
          (stage) => stage.id === currentStage.id,
        );

        return (
          isRequiredStageName(currentStage.name) &&
          nextStage !== undefined &&
          nextStage.type !== currentStage.type
        );
      });

      if (retypedRequiredStage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No se puede cambiar el tipo de la etapa obligatoria ${retypedRequiredStage.name}`,
        });
      }
    }
    const nextStagesById = new Map(
      input.stages.map((stage) => [stage.id, stage]),
    );

    const removedStageIds = new Set(
      currentStages
        .filter((stage) => !nextStagesById.has(stage.id))
        .map((stage) => stage.id),
    );

    const occupiedRemovedStage = currentJobOpening.applications.find(
      (application) => removedStageIds.has(application.currentStageId),
    );

    if (occupiedRemovedStage) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "No se puede eliminar una etapa que todavía contiene candidatos",
      });
    }

    return ctx.db.$transaction(async (tx) => {
      const { count } = await tx.jobOpening.updateMany({
        where: {
          id: input.id,
          status: {
            notIn: ["Closed", "Cancelled"],
          },
        },
        data: {
          name: input.name,
          status: nextStatus,
          hasBeenOpened: hasBeenOpened || nextStatus === "Open",
          location: input.location,
          targetClosingDate: nextTargetClosingDate,
          areaId: input.areaId,

          // Unchanged stages are not rewritten.
          ...(stagesChanged || colorsChanged
            ? {
                stages: input.stages.map((stage) =>
                  toPersistedStage(stage, persistedStagesById.get(stage.id)),
                ),
              }
            : {}),
        },
      });

      if (count !== 1) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No se puede modificar una vacante cerrada o cancelada",
        });
      }

      return tx.jobOpening.update({
        where: {
          id: input.id,
        },
        data: {
          seniorities: {
            set: input.seniorityIds.map((id) => ({ id })),
          },

          hiringManagers: {
            set: input.hiringManagerIds.map((id) => ({ id })),
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });
    });
  });
