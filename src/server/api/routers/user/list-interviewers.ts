import { TRPCError } from "@trpc/server";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const listInterviewers = protectedProcedure.query(async ({ ctx }) => {
  const permission = await auth.api.hasPermission({
    headers: ctx.headers,
    body: { permissions: { interview: ["create"] } },
  });

  if (!permission.success) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return ctx.db.user.findMany({
    where: {
      status: "Active",
      banned: false,
      members: {
        some: {
          role: "hiringManager",
        },
      },
    },
    orderBy: [{ name: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      name: true,
      lastName: true,
    },
  });
});
