import { type JSONContent } from "@tiptap/react";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "~/generated/prisma/client";
import { z, type ZodType } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

const tiptapNodeSchema: ZodType<JSONContent> = z.lazy(() =>
  z.object({
    type: z.string().optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(tiptapNodeSchema).optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .optional(),
    text: z.string().optional(),
  })
);

export const saveCandidateNoteProcedure = protectedProcedure
  .input(
    z.object({
      candidateId: z.string().min(1),
      content: tiptapNodeSchema,
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const candidate = await ctx.db.applicant.findUnique({
      where: { id: input.candidateId },
      select: { id: true },
    });

    if (!candidate) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const data = {
      content: input.content as Prisma.InputJsonValue,
      lastModifiedById: ctx.session.user.id,
    };

    return ctx.db.applicantNote.upsert({
      where: { applicantId: input.candidateId },
      create: { applicantId: input.candidateId, ...data },
      update: data,
      select: { lastModified: true },
    });
  });