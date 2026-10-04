import { randomUUID } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import {
  addRequiredStagesIssues,
  isRequiredStageName,
  jobOpeningStagesChanged,
  jobOpeningStageSchema,
  jobOpeningStageTypeSchema,
  updateJobOpeningSchema,
  type JobOpeningStageType,
} from "~/lib/validations/job-opening";
import { protectedProcedure } from "~/server/api/trpc";

type CurrentStage = {
  id: string;
  name: string;
  type: JobOpeningStageType;
};

// JobOpening.stages keeps the format read by the pipeline and interviews:
// { key, name, type: "Ninguna" | "Entrevista" | "Oferta", color, label }.
const PERSISTED_STAGE_TYPES: Record<string, JobOpeningStageType> = {
  Ninguna: "none",
  Entrevista: "interview",
  Oferta: "offer",
};

const FORM_TO_PERSISTED_STAGE_TYPE: Record<JobOpeningStageType, string> = {
  none: "Ninguna",
  interview: "Entrevista",
  offer: "Oferta",
  // "Contratado/a" is stored with type "Ninguna".
  hired: "Ninguna",
};

// Neutral color for stages added from the edit form (same as "Aplicado").
const NEW_STAGE_COLOR = "#94a3b8";

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
    const parsedType = jobOpeningStageTypeSchema.safeParse(stageRecord.type);

    const type =
      (typeof stageRecord.type === "string"
        ? PERSISTED_STAGE_TYPES[stageRecord.type]
        : undefined) ??
      (parsedType.success ? parsedType.data : inferStageType(name));

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
  stage: CurrentStage,
  persistedStage: Record<string, unknown> | undefined,
) {
  const type = FORM_TO_PERSISTED_STAGE_TYPE[stage.type];

  if (!persistedStage) {
    return {
      key: stage.id,
      name: stage.name,
      type,
      color: NEW_STAGE_COLOR,
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
    color:
      typeof persistedStage.color === "string"
        ? persistedStage.color
        : NEW_STAGE_COLOR,
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
          stages: true,
          applications: {
            select: {
              currentStage: true,
            },
          },
        },
      }),

      ctx.db.area.findFirst({
        where: {
          id: input.areaId,
          deletedAt: null,
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
          deletedAt: null,
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
            status: "Active",
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

    const currentStages = getCurrentStages(currentJobOpening.stages);
    const persistedStagesById = getPersistedStagesById(
      currentJobOpening.stages,
    );
    const stagesChanged = jobOpeningStagesChanged(currentStages, input.stages);
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

    const removedStageNames = new Set(
      currentStages
        .filter((stage) => !nextStagesById.has(stage.id))
        .map((stage) => stage.name),
    );

    const occupiedRemovedStage = currentJobOpening.applications.find(
      (application) => removedStageNames.has(application.currentStage),
    );

    if (occupiedRemovedStage) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "No se puede eliminar una etapa que todavía contiene candidatos",
      });
    }

    const renamedStages = currentStages.flatMap((currentStage) => {
      const nextStage = nextStagesById.get(currentStage.id);

      if (!nextStage || nextStage.name === currentStage.name) {
        return [];
      }

      return [
        {
          previousName: currentStage.name,
          nextName: nextStage.name,
          temporaryName: `__stage_migration_${randomUUID()}`,
        },
      ];
    });

    return ctx.db.$transaction(async (transaction) => {
      for (const renamedStage of renamedStages) {
        await transaction.application.updateMany({
          where: {
            jobOpeningId: input.id,
            currentStage: renamedStage.previousName,
          },
          data: {
            currentStage: renamedStage.temporaryName,
          },
        });
      }

      for (const renamedStage of renamedStages) {
        await transaction.application.updateMany({
          where: {
            jobOpeningId: input.id,
            currentStage: renamedStage.temporaryName,
          },
          data: {
            currentStage: renamedStage.nextName,
          },
        });
      }

      return transaction.jobOpening.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          status: input.status,
          hasBeenOpened: hasBeenOpened || input.status === "Open",
          location: input.location,
          openingDate: new Date(`${input.openingDate}T00:00:00.000Z`),
          targetClosingDate: new Date(
            `${input.targetClosingDate}T00:00:00.000Z`,
          ),

          // Unchanged stages are not rewritten.
          ...(stagesChanged
            ? {
                stages: input.stages.map((stage) =>
                  toPersistedStage(stage, persistedStagesById.get(stage.id)),
                ),
              }
            : {}),

          area: {
            connect: {
              id: input.areaId,
            },
          },

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
