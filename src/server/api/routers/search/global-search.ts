import { z } from "zod";

import { auth } from "~/lib/auth";
import { isHiringManagerAssignedToApplicant } from "~/server/api/procedures/is-hiring-manager-assigned-to-applicant";
import { isHiringManagerAssignedToJobOpening } from "~/server/api/procedures/is-hiring-manager-assigned-to-job-opening";
import { protectedProcedure } from "~/server/api/trpc";

const RESULTS_LIMIT = 4;

export const globalSearch = protectedProcedure
  .input(z.object({ query: z.string().trim().min(1) }))
  .query(async ({ ctx, input }) => {
    const [
      canReadAllApplicants,
      canReadAssignedApplicants,
      canReadAllJobOpenings,
      canReadAssignedJobOpenings,
    ] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { applicant: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { applicant: ["readAssigned"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { jobOpening: ["readAssigned"] } },
      }),
    ]);

    const canReadJobOpenings =
      canReadAllJobOpenings.success || canReadAssignedJobOpenings.success;
    const canReadApplicants =
      canReadAllApplicants.success || canReadAssignedApplicants.success;

    const [applicants, jobOpenings] = await Promise.all([
      canReadApplicants
        ? ctx.db.applicant.findMany({
            where: {
              ...(canReadAllApplicants.success
                ? {}
                : isHiringManagerAssignedToApplicant(ctx.session.user.id)),
              OR: [
                { name: { contains: input.query, mode: "insensitive" } },
                { lastName: { contains: input.query, mode: "insensitive" } },
                {
                  tags: {
                    some: {
                      name: { contains: input.query, mode: "insensitive" },
                    },
                  },
                },
              ],
            },
            take: RESULTS_LIMIT,
            select: {
              id: true,
              name: true,
              lastName: true,
              role: { select: { name: true } },
              seniority: { select: { name: true, color: true } },
              tags: { select: { name: true, color: true } },
            },
          })
        : [],
      canReadJobOpenings
        ? ctx.db.jobOpening.findMany({
            where: {
              name: { contains: input.query, mode: "insensitive" },
              ...(canReadAllJobOpenings.success
                ? {}
                : isHiringManagerAssignedToJobOpening(ctx.session.user.id)),
            },
            take: RESULTS_LIMIT,
            orderBy: { openingDate: "desc" },
            select: {
              id: true,
              name: true,
              status: true,
              area: { select: { name: true } },
              applications: {
                where: { active: true },
                select: { applicantId: true },
              },
            },
          })
        : [],
    ]);

    return {
      applicants: applicants.map((applicant) => ({
        id: applicant.id,
        name:
          `${applicant.name ?? ""} ${applicant.lastName ?? ""}`.trim() || "-",
        initials:
          applicant.name && applicant.lastName
            ? `${applicant.name[0]}${applicant.lastName[0]}`.toUpperCase()
            : "-",
        role: applicant.role.name,
        seniority: applicant.seniority
          ? { name: applicant.seniority.name, color: applicant.seniority.color }
          : null,
        tags: applicant.tags.map((tag) => ({
          name: tag.name,
          color: tag.color,
        })),
      })),
      jobOpenings: jobOpenings.map((jobOpening) => ({
        id: jobOpening.id,
        name: jobOpening.name,
        area: jobOpening.area.name,
        status: jobOpening.status,
        applicantsCount: jobOpening.applications.length,
      })),
    };
  });
