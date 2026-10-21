import { isDeepStrictEqual } from "node:util";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const saveApplicantNoteProcedure = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
      content: z.json().refine((value) => value !== null),
      // True on the first save of an editing session: logs the edit once.
      createEditActivity: z.boolean().default(false),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const applicant = await ctx.db.applicant.findUnique({
      where: { id: input.applicantId },
      select: { id: true, note: { select: { id: true } } },
    });

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          applicantNote: [applicant.note ? "update" : "create"],
        },
      },
    });

    if (!permission.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para modificar las notas del candidato",
      });
    }

    const data = {
      content: input.content,
      lastModifiedById: ctx.session.user.id,
    };

    const select = {
      lastModified: true,
      lastModifiedBy: {
        select: { name: true, lastName: true },
      },
    } as const;

    return ctx.db.$transaction(async (tx) => {
      // INSERT ... ON CONFLICT DO NOTHING: the database decides atomically
      // whether this request created the note (count 1) or it already existed.
      const { count: createdCount } = await tx.applicantNote.createMany({
        data: [{ applicantId: input.applicantId, ...data }],
        skipDuplicates: true,
      });

      if (createdCount === 0) {
        let editActivityLogged = false;

        if (input.createEditActivity) {
          // Lock the note so the comparison and the update below are based on
          // the same persisted content, even with concurrent saves.
          await tx.$queryRaw`
            SELECT "id" FROM "applicant_note" WHERE "applicant_id" = ${input.applicantId} FOR UPDATE
          `;

          const previous = await tx.applicantNote.findUniqueOrThrow({
            where: { applicantId: input.applicantId },
            select: { content: true },
          });

          // Only a real content change is logged as an edit.
          if (!isDeepStrictEqual(previous.content, input.content)) {
            await tx.activity.create({
              data: {
                applicantId: input.applicantId,
                jobOpeningId: null,
                createdById: ctx.session.user.id,
                description: "editó la nota del candidato",
              },
            });
            editActivityLogged = true;
          }
        }

        const note = await tx.applicantNote.update({
          where: { applicantId: input.applicantId },
          data,
          select,
        });

        return { ...note, activityLogged: editActivityLogged };
      }

      await tx.activity.create({
        data: {
          applicantId: input.applicantId,
          jobOpeningId: null,
          createdById: ctx.session.user.id,
          description: "creó una nota del candidato",
        },
      });

      const note = await tx.applicantNote.findUniqueOrThrow({
        where: { applicantId: input.applicantId },
        select,
      });

      return { ...note, activityLogged: true };
    });
  });
