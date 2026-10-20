import { z } from "zod";

import { getInterviewName } from "~/lib/get-interview-name";
import { parseStages } from "~/lib/validations/job-opening";
import { publicProcedure } from "~/server/api/trpc";
import { getPublicLinkStatus } from "~/server/public-link/validity";

export const getByToken = publicProcedure
  .input(
    z.object({
      token: z.string().min(1),
    }),
  )
  .query(async ({ ctx, input }) => {
    const link = await ctx.db.publicLink.findUnique({
      where: { token: input.token },
      select: {
        id: true,
        name: true,
        includeSalary: true,
        expirationDate: true,
        revokedAt: true,
        createdBy: {
          select: {
            name: true,
            lastName: true,
          },
        },
        application: {
          select: {
            deletedAt: true,
            active: true,
            currentStageId: true,
            availability: true,
            desiredSalaryAmount: true,
            desiredSalaryCurrency: true,
            disqualificationDescription: true,
            disqualificationMotive: {
              select: {
                name: true,
              },
            },
            jobOpening: {
              select: {
                id: true,
                name: true,
                status: true,
                stages: true,
                location: true,
                area: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            applicant: {
              select: {
                id: true,
                deletedAt: true,
                name: true,
                lastName: true,
                photo: true,
                email: true,
                phone: true,
                country: true,
                englishLevel: true,
                title: true,
                academicInstitution: true,
                resume: true,
                education: true,
                role: {
                  select: {
                    name: true,
                  },
                },
                seniority: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            interviews: {
              where: { deletedAt: null },
              orderBy: {
                date: "asc",
              },
              select: {
                id: true,
                exploratoryName: true,
                stageId: true,
                duration: true,
                modality: true,
                date: true,
                interviewers: {
                  select: {
                    name: true,
                    lastName: true,
                  },
                },
                note: {
                  select: {
                    content: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !link ||
      link.application.deletedAt ||
      link.application.applicant.deletedAt
    ) {
      return { status: "not_found" as const };
    }

    const now = new Date();
    const linkStatus = getPublicLinkStatus(link, now);

    if (linkStatus !== "active") {
      return { status: linkStatus };
    }

    const application = link.application;
    const applicant = application.applicant;
    const jobOpening = application.jobOpening;

    const stages = parseStages(jobOpening.stages);
    const currentStageName =
      stages.find((stage) => stage.key === application.currentStageId)?.name ??
      application.currentStageId;

    let formattedSalary: string | null = null;
    if (link.includeSalary && application.desiredSalaryAmount) {
      const currency = application.desiredSalaryCurrency ?? "USD";
      formattedSalary = `${currency} ${application.desiredSalaryAmount.toString()}`;
    }

    return {
      status: "active" as const,
      recruiterName: `${link.createdBy.name} ${link.createdBy.lastName}`.trim(),
      expirationDate: link.expirationDate,
      candidate: {
        name: applicant.name,
        lastName: applicant.lastName,
        photo: applicant.photo,
        roleName: applicant.role?.name ?? null,
        seniorityName: applicant.seniority?.name ?? null,
        email: applicant.email,
        phone: applicant.phone,
        country: applicant.country,
        englishLevel: applicant.englishLevel,
        title: applicant.title,
        academicInstitution: applicant.academicInstitution,
        resumeUrl: applicant.resume,
        educationUrl: applicant.education,
      },
      application: {
        active: application.active,
        jobOpeningName: jobOpening.name,
        jobOpeningStatus: jobOpening.status,
        currentStage: currentStageName,
        areaName: jobOpening.area?.name ?? null,
        availability: application.availability,
        location: jobOpening.location,
        salary: formattedSalary,
        includeSalary: link.includeSalary,
        disqualificationMotive: !application.active
          ? (application.disqualificationMotive?.name ?? null)
          : null,
        disqualificationDescription: !application.active
          ? (application.disqualificationDescription ?? null)
          : null,
      },
      interviews: application.interviews.map((interview) => ({
        id: interview.id,
        name: getInterviewName(interview, jobOpening.stages),
        duration: interview.duration,
        modality:
          interview.modality === "VideoCall"
            ? "Virtual"
            : interview.modality === "InPerson"
              ? "Presencial"
              : interview.modality,
        date: interview.date,
        interviewers: interview.interviewers.map((user) =>
          `${user.name} ${user.lastName}`.trim(),
        ),
        note: extractNoteText(interview.note?.content),
      })),
    };
  });

function extractNoteText(content: unknown): string | null {
  if (content == null) return null;
  if (typeof content === "string") {
    const trimmed = content.trim();
    return trimmed || null;
  }
  if (typeof content === "object") {
    const lines: string[] = [];

    function extractText(node: unknown): string {
      if (!node || typeof node !== "object") return "";
      const obj = node as Record<string, unknown>;
      if (typeof obj.text === "string") {
        return obj.text;
      }
      if (Array.isArray(obj.content)) {
        return obj.content.map(extractText).join("");
      }
      return "";
    }

    function walkBlocks(node: unknown) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        for (const item of node) walkBlocks(item);
        return;
      }
      const obj = node as Record<string, unknown>;
      if (
        obj.type === "paragraph" ||
        obj.type === "heading" ||
        obj.type === "listItem"
      ) {
        const text = extractText(obj).trim();
        if (text) lines.push(text);
      } else if (Array.isArray(obj.content)) {
        for (const child of obj.content) walkBlocks(child);
      }
    }

    walkBlocks(content);
    if (lines.length > 0) return lines.join("\n");

    const fallbackText = extractText(content).trim();
    return fallbackText || null;
  }
  return String(content);
}

