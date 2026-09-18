import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";



export const getApplicantById = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
    }),
  )
  .query(async ({ input, ctx }) => {
    const applicant = await ctx.db.applicant.findFirst({
      where: { id: input.id },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        photo: true,
        country: true,
        linkedin: true,
        englishLevel: true,
        source: true,
        hearAboutUs: true,
        title: true,
        academicInstitution: true,
        careerStartYear: true,
        careerEndYear: true,
        education: true,
        resume: true,
        role: {
            select: {
            id: true,
            name: true,
            },
        },

        area: {
            select: {
            id: true,
            name: true,
            },
        },

        seniority: {
            select: {
            id: true,
            name: true,
            },
        },

        tags: {
            select: {
            id: true,
            name: true,
            color: true,
            },
        },
    },
    });

    if (!applicant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Candidato no encontrado",
      });
    }

    return { ...applicant };
  });