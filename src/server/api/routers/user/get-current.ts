import { protectedProcedure } from "~/server/api/trpc";

// Always scoped to the session user; no userId input is accepted.
export const getCurrent = protectedProcedure.query(async ({ ctx }) => {
  const organizationId = ctx.session.session.activeOrganizationId;

  const user = await ctx.db.user.findUniqueOrThrow({
    where: {
      id: ctx.session.user.id,
    },
    select: {
      name: true,
      lastName: true,
      image: true,
      members: organizationId
        ? {
            where: { organizationId },
            select: { role: true },
            take: 1,
          }
        : false,
    },
  });

  return {
    name: user.name,
    lastName: user.lastName,
    image: user.image,
    role: user.members?.[0]?.role ?? null,
  };
});
