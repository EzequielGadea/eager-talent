import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";
import { publicLinkDtoSelect, toPublicLinkDto } from "./dto";

export const listByApplication = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
      jobOpeningId: z.string().min(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    const permission = await auth.api.hasPermission({
      headers: ctx.headers,
      body: { permissions: { publicLink: ["read"] } },
    });

    if (!permission.success) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Active, expired and revoked links are all returned to keep the history.
    const links = await ctx.db.publicLink.findMany({
      where: {
        applicantId: input.applicantId,
        jobOpeningId: input.jobOpeningId,
      },
      select: publicLinkDtoSelect,
      orderBy: { creationDate: "desc" },
    });

    const now = new Date();

    return links.map((link) => toPublicLinkDto(link, now));
  });
