import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { getTagColor } from "~/lib/tags/get-tag-color";

export const createTag = protectedProcedure
  .input(
    z.object({
      name: z.string().trim().min(1),
      isSkill: z.boolean().default(false),
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
        message: "No tenés permiso para crear etiquetas",
      });
    }

    return ctx.db.tag.create({
      data: {
        ...input,
        color: getTagColor(input.name),
      },
    });
  });
