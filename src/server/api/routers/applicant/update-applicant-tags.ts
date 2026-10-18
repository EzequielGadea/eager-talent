import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const updateApplicantTags = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
      tagIds: z.array(z.string()).min(0),
    }),
  )
  .mutation(async ({ ctx, input }) => {
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
        message: "No tenés permiso para editar las etiquetas",
      });
    }

    return ctx.db.$transaction(async (tx) => {
      const applicant = await tx.applicant.findUnique({
        where: { id: input.applicantId },
        select: {
          tags: {
            select: { id: true },
          },
        },
      });

      if (!applicant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidato no encontrado",
        });
      }

      const currentIds = new Set(applicant.tags.map((tag) => tag.id));
      const nextIds = new Set(input.tagIds);

      const tagsChanged =
        currentIds.size !== nextIds.size ||
        [...nextIds].some((id) => !currentIds.has(id));

      if (!tagsChanged) {
        return applicant;
      }

      const updated = await tx.applicant.update({
        where: { id: input.applicantId },
        data: {
          tags: {
            set: input.tagIds.map((id) => ({ id })),
          },
        },
        select: {
          tags: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      await tx.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: null,
          createdById: ctx.session.user.id,
          description: "actualizó las etiquetas del candidato",
        },
      });

      return updated;
    });
  });