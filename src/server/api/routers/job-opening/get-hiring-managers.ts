import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const getJobOpeningHiringManagers = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const canReadJobOpenings = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          jobOpening: ["read"],
        },
      },
    });

    if (!canReadJobOpenings.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para consultar Hiring Managers",
      });
    }

    const organizationId = ctx.session.session.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No hay una organización activa",
      });
    }

    return ctx.db.user.findMany({
      where: {
        status: "Active",
        banned: false,
        members: {
          some: {
            organizationId,
            role: "hiringManager",
          },
        },
      },
      select: {
        id: true,
        name: true,
        lastName: true,
      },
      orderBy: [{ name: "asc" }, { lastName: "asc" }],
    });
  });
