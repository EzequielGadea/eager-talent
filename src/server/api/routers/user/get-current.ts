import { protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Always scoped to the session user; no userId input is accepted.
export const getCurrent = protectedProcedure.query(async ({ ctx }) => {
  const organizationId = ctx.session.session.activeOrganizationId;

  const user = await ctx.db.user.findUnique({
    where: {
      id: ctx.session.user.id,
    },
    select: {
      name: true,
      lastName: true,
      email: true,
      image: true,
      createdAt: true,
      members: organizationId
        ? {
            where: { organizationId },
            select: { role: true },
            take: 1,
          }
        : false,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No se encontró el usuario.",
    });
  }

  return {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    role: user.members?.[0]?.role ?? null,
  };
});
