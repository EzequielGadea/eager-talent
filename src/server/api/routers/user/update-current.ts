import { z } from "zod";

import { protectedProcedure } from "~/server/api/trpc";
import { profileSchema } from "~/lib/validations/profile";

export const updateCurrent = protectedProcedure
  .input(
    profileSchema.extend({
      image: z.string().nullable().optional(),
    }),
  )
  .mutation(({ ctx, input }) =>
    ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        name: input.name,
        lastName: input.lastName,
        ...(input.image !== undefined ? { image: input.image } : {}),
      },
      select: {
        name: true,
        lastName: true,
        image: true,
      },
    }),
  );
