import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const getSharingData = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          applicant: ["update"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para compartir candidatos",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No hay una organización activa",
      });
    }

    const [applicant, members] = await Promise.all([
      ctx.db.applicant.findUnique({
        where: {
          id: input.applicantId,
        },
        select: {
          id: true,
          applicantHiringManagers: {
            orderBy: {
              sharedAt: "desc",
            },
            select: {
              sharedAt: true,
              viewedAt: true,
              hiringManager: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
        },
      }),
      ctx.db.member.findMany({
        where: {
          organizationId,
          role: "hiringManager",
          user: {
            status: "Active",
            banned: false,
          },
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              image: true,
            },
          },
        },
      }),
    ]);

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    const currentAccess = applicant.applicantHiringManagers.map(
      ({ hiringManager, sharedAt, viewedAt }) => ({
        ...hiringManager,
        sharedAt: sharedAt.toISOString(),
        viewedAt: viewedAt?.toISOString() ?? null,
      }),
    );

    const currentAccessIds = new Set(
      currentAccess.map((manager) => manager.id),
    );

    const availableManagers = members
      .map(({ user }) => user)
      .filter((manager) => !currentAccessIds.has(manager.id))
      .sort((firstManager, secondManager) =>
        `${firstManager.name} ${firstManager.lastName}`.localeCompare(
          `${secondManager.name} ${secondManager.lastName}`,
          "es",
        ),
      );

    return {
      availableManagers,
      currentAccess,
    };
  });
