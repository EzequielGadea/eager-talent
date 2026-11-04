import { isDeepStrictEqual } from "node:util";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { getInterviewName } from "~/lib/get-interview-name";
import { isHiringManagerAssignedToInterview } from "~/server/api/procedures/is-hiring-manager-assigned-to-interview";
import { protectedProcedure } from "~/server/api/trpc";

export const saveInterviewNoteProcedure = protectedProcedure
  .input(
    z.object({
      interviewId: z.string().min(1),
      content: z.json().refine((value) => value !== null),
      // True on the first save of an editing session: logs the edit once.
      createEditActivity: z.boolean().default(false),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const interview = await ctx.db.interview.findUnique({
      where: { id: input.interviewId, deletedAt: null },
      select: {
        id: true,
        exploratoryName: true,
        stageId: true,
        applicantId: true,
        jobOpeningId: true,
        application: {
          select: { jobOpening: { select: { stages: true } } },
        },
        note: { select: { id: true } },
      },
    });

    if (!interview) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entrevista no encontrada",
      });
    }

    const [canModifyAllResult, canModifyAssignedResult] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: {
          permissions: {
            interviewNote: [interview.note ? "update" : "create"],
          },
        },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: {
          permissions: {
            interviewNote: [
              interview.note ? "updateAssigned" : "createAssigned",
            ],
          },
        },
      }),
    ]);

    if (!canModifyAllResult.success) {
      const isAssigned =
        canModifyAssignedResult.success &&
        (await ctx.db.interview.findFirst({
          where: {
            id: interview.id,
            ...isHiringManagerAssignedToInterview(ctx.session.user.id),
          },
          select: { id: true },
        }));

      if (!isAssigned) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tenés permiso para modificar las notas de la entrevista",
        });
      }
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

    const activityData = {
      applicantId: interview.applicantId,
      jobOpeningId: interview.jobOpeningId,
      createdById: ctx.session.user.id,
    };

    const interviewName = getInterviewName(
      interview,
      interview.application?.jobOpening.stages,
    );

    return ctx.db.$transaction(async (tx) => {
      // INSERT ... ON CONFLICT DO NOTHING: the database decides atomically
      // whether this request created the note (count 1) or it already existed.
      const { count: createdCount } = await tx.interviewNote.createMany({
        data: [{ interviewId: interview.id, ...data }],
        skipDuplicates: true,
      });

      if (createdCount === 0) {
        let editActivityLogged = false;

        if (input.createEditActivity) {
          // Lock the note so the comparison and the update below are based on
          // the same persisted content, even with concurrent saves.
          await tx.$queryRaw`
            SELECT "id" FROM "interview_note" WHERE "interview_id" = ${interview.id} FOR UPDATE
          `;

          const previous = await tx.interviewNote.findUniqueOrThrow({
            where: { interviewId: interview.id },
            select: { content: true },
          });

          // Only a real content change is logged as an edit.
          if (!isDeepStrictEqual(previous.content, input.content)) {
            await tx.activity.create({
              data: {
                ...activityData,
                description: `editó las notas de ${interviewName}`,
              },
            });
            editActivityLogged = true;
          }
        }

        const note = await tx.interviewNote.update({
          where: { interviewId: interview.id },
          data,
          select,
        });

        return { ...note, activityLogged: editActivityLogged };
      }

      await tx.activity.create({
        data: {
          ...activityData,
          description: `creó las notas de ${interviewName}`,
        },
      });

      const note = await tx.interviewNote.findUniqueOrThrow({
        where: { interviewId: interview.id },
        select,
      });

      return { ...note, activityLogged: true };
    });
  });
