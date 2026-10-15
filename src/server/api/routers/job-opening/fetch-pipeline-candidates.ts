import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { getInterviewName } from "~/lib/get-interview-name";
import { getApplicantSearchWhere } from "~/server/api/procedures/get-applicant-search-where";
import { protectedProcedure } from "~/server/api/trpc";

export const fetchPipelineCandidates = protectedProcedure
  .input(
    z.object({
      jobOpeningId: z.string(),
      stageId: z.string(),
      limit: z.number().int().positive().max(50).default(3),
      offset: z.number().int().nonnegative().default(0),
      search: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const canReadAll = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          application: ["read"],
        },
      },
    });

    const canReadAssigned = await auth.api.hasPermission({
      headers: ctx.headers,
      body: {
        permissions: {
          application: ["readAssigned"],
        },
      },
    });

    if (!canReadAll.success && !canReadAssigned.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para consultar el pipeline",
      });
    }

    const where = {
      jobOpeningId: input.jobOpeningId,
      currentStageId: input.stageId,
      active: true,
      applicant: getApplicantSearchWhere(input.search),
      ...(canReadAll.success
        ? {}
        : {
            jobOpening: {
              hiringManagers: {
                some: {
                  id: ctx.session.user.id,
                },
              },
            },
          }),
    };

    const now = Date.now();
    const MAX_INTERVIEW_MS = 24 * 60 * 60_000;

    const [applications, total] = await Promise.all([
      ctx.db.application.findMany({
        where,
        orderBy: [
          {
            stageEntryDate: "desc",
          },
          {
            applicantId: "asc",
          },
        ],
        skip: input.offset,
        take: input.limit,
        select: {
          applicantId: true,
          jobOpeningId: true,
          jobOpening: {
            select: {
              stages: true,
            },
          },
          applicant: {
            select: {
              name: true,
              lastName: true,
              photo: true,
              role: {
                select: {
                  name: true,
                },
              },
              interviews: {
                where: {
                  status: "Scheduled",
                  jobOpeningId: input.jobOpeningId,
                  date: { gt: new Date(now - MAX_INTERVIEW_MS) },
                },
                orderBy: {
                  date: "asc",
                },
                select: {
                  id: true,
                  exploratoryName: true,
                  stageId: true,
                  modality: true,
                  duration: true,
                  date: true,
                  interviewers: {
                    select: {
                      id: true,
                      name: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      ctx.db.application.count({
        where,
      }),
    ]);

    const candidates = applications.map((application) => {
      const interviews = application.applicant.interviews.filter(
        (interview) =>
          interview.date!.getTime() + interview.duration * 60_000 > now,
      );
      const nextInterview = interviews[0];

      return {
        applicantId: application.applicantId,
        name: application.applicant.name,
        lastName: application.applicant.lastName,
        photo: application.applicant.photo,
        role: application.applicant.role.name,
        nextInterview: nextInterview ? { date: nextInterview.date! } : null,
        scheduledInterviews: interviews.map((interview) => ({
          id: interview.id,
          name: getInterviewName(interview, application.jobOpening.stages),
          modality: interview.modality,
          duration: interview.duration,
          interviewers: interview.interviewers,
          date: interview.date!,
        })),
      };
    });

    return {
      candidates,
      total,
      hasMore: input.offset + candidates.length < total,
      nextOffset: input.offset + candidates.length,
    };
  });
