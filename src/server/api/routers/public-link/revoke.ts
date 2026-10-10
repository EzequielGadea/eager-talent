import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import {
  getPublicLinkStatus,
  validPublicLinkWhere,
} from "~/server/public-link/validity";

export const revokePublicLink = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
      applicantId: z.string().min(1),
      jobOpeningId: z.string().min(1),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { publicLink: ["update"] } },
    });

    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Scoped to the given application so a link id from another application
    // is treated as not found.
    const linkScope = {
      id: input.id,
      applicantId: input.applicantId,
      jobOpeningId: input.jobOpeningId,
    };

    const link = await ctx.db.publicLink.findFirst({
      where: linkScope,
      select: { name: true, revokedAt: true, expirationDate: true },
    });

    if (!link) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El enlace no existe",
      });
    }

    const now = new Date();
    const status = getPublicLinkStatus(link, now);

    if (status !== "active") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          status === "revoked"
            ? "El enlace ya está revocado"
            : "El enlace ya está vencido",
      });
    }

    return ctx.db.$transaction(async (tx) => {
      // Conditional update: only one concurrent request can revoke the link,
      // so the activity is logged exactly once.
      const { count } = await tx.publicLink.updateMany({
        where: { ...linkScope, ...validPublicLinkWhere(now) },
        data: { revokedAt: now },
      });

      if (count !== 1) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "El enlace fue modificado. Recargá e intentá de nuevo.",
        });
      }

      await tx.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: input.jobOpeningId,
          createdById: ctx.session.user.id,
          description: `revocó el enlace público "${link.name}"`,
        },
      });

      return { id: input.id, status: "revoked" as const, revokedAt: now };
    });
  });
