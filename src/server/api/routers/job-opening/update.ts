import { randomUUID } from "node:crypto";

import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import {
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

    const type = parsedType.success ? parsedType.data : inferStageType(name);

    return [
      {
        id:
          typeof stageRecord.id === "string" && stageRecord.id !== ""
            ? stageRecord.id
            : `stage-${index}`,
        name,
        type,
      },
    ];
  });
}

function stagesAreDifferent(
  currentStages: CurrentStage[],
  nextStages: CurrentStage[],
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
    const hasBeenOpened =
      currentJobOpening.hasBeenOpened || currentJobOpening.status === "Open";
    if (hasBeenOpened && stagesAreDifferent(currentStages, input.stages)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "No se puede modificar el flujo mientras la vacante está abierta",
      });
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

          stages: input.stages.map((stage) => ({
            id: stage.id,
            name: stage.name,
            type: stage.type,
          })),

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
