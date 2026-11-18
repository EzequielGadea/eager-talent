import { TZDate } from "@date-fns/tz";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { z } from "zod";

import type { Prisma } from "~/generated/prisma/client";
import { Source } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";
import { canExportNotes } from "~/lib/auth/can-export-notes";
import { protectedProcedure } from "~/server/api/trpc";
import { getApplicantSearchWhere } from "./search-where";

const MONTEVIDEO_TIME_ZONE = "America/Montevideo";
const EXPORT_DATE_FORMAT = "dd.MM.yyyy HH:mm";

const exportNotesInput = z.object({
  roleId: z.array(z.string()).default([]),
  seniorityId: z.array(z.string()).default([]),
  jobOpeningId: z.array(z.string()).default([]),
  areaId: z.array(z.string()).default([]),
  tagId: z.array(z.string()).default([]),
  source: z.array(z.enum(Source)).default([]),
  search: z.string().optional(),
});

export const exportNotes = protectedProcedure
  .input(exportNotesInput)
  .mutation(async ({ ctx, input }) => {
    const organizationId = ctx.session.session.activeOrganizationId;
    const member = organizationId
      ? await ctx.db.member.findUnique({
          where: {
            organizationId_userId: {
              organizationId,
              userId: ctx.session.user.id,
            },
          },
          select: { role: true },
        })
      : null;

    if (!canExportNotes(member?.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para exportar notas",
      });
    }

    const [canReadApplicants, canReadApplicantNotes, canReadInterviewNotes] =
      await Promise.all([
        auth.api.hasPermission({
          headers: ctx.headers,
          body: { permissions: { applicant: ["read"] } },
        }),
        auth.api.hasPermission({
          headers: ctx.headers,
          body: { permissions: { applicantNote: ["read"] } },
        }),
        auth.api.hasPermission({
          headers: ctx.headers,
          body: { permissions: { interviewNote: ["read"] } },
        }),
      ]);

    if (
      !canReadApplicants.success ||
      (!canReadApplicantNotes.success && !canReadInterviewNotes.success)
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para exportar notas",
      });
    }

    const filtersWhere: Prisma.ApplicantWhereInput = {
      ...getApplicantSearchWhere(input.search),
      ...(input.roleId.length > 0 && { roleId: { in: input.roleId } }),
      ...(input.seniorityId.length > 0 && {
        seniorityId: { in: input.seniorityId },
      }),
      ...(input.areaId.length > 0 && { areaId: { in: input.areaId } }),
      ...(input.jobOpeningId.length > 0 && {
        applications: {
          some: { active: true, jobOpeningId: { in: input.jobOpeningId } },
        },
      }),
      ...(input.tagId.length > 0 && {
        tags: { some: { id: { in: input.tagId } } },
      }),
      ...(input.source.length > 0 && { source: { in: input.source } }),
    };

    const applicants = await ctx.db.applicant.findMany({
      where: {
        deletedAt: null,
        AND: [filtersWhere],
      },
      orderBy: [{ lastName: "asc" }, { name: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        lastName: true,
        note: {
          select: {
            content: true,
            deletedAt: true,
            lastModified: true,
            lastModifiedBy: { select: { name: true, lastName: true } },
          },
        },
        interviews: {
          where: {
            deletedAt: null,
            note: { is: { deletedAt: null } },
          },
          orderBy: [
            { date: { sort: "desc", nulls: "last" } },
            { id: "desc" },
          ],
          select: {
            id: true,
            date: true,
            note: { select: { content: true, deletedAt: true } },
            interviewers: {
              orderBy: [{ name: "asc" }, { lastName: "asc" }],
              select: { name: true, lastName: true },
            },
          },
        },
      },
    });

    return {
      candidateNotes: applicants.flatMap((applicant) => {
        const notes =
          canReadApplicantNotes.success &&
          !applicant.note?.deletedAt
            ? extractNoteText(applicant.note?.content)
            : null;
        return notes
          ? [
              {
                applicant_id: applicant.id,
                nombre: `${applicant.name} ${applicant.lastName}`.trim(),
                "ultima modificacion por": `${applicant.note?.lastModifiedBy.name} ${applicant.note?.lastModifiedBy.lastName}`.trim(),
                "ultima modificacion a las": formatExportDate(
                  applicant.note!.lastModified,
                ),
                nota: notes,
              },
            ]
          : [];
      }),
      interviewNotes: applicants.flatMap((applicant) =>
        canReadInterviewNotes.success
          ? applicant.interviews.flatMap((interview) => {
              const notes =
                !interview.note?.deletedAt
                  ? extractNoteText(interview.note?.content)
                  : null;
              return notes
                ? [
                    {
                      applicant_id: applicant.id,
                      interview_id: interview.id,
                      candidato: `${applicant.name} ${applicant.lastName}`.trim(),
                      entrevistador: interview.interviewers
                        .map(({ name, lastName }) => `${name} ${lastName}`.trim())
                        .join(", "),
                      "fecha entrevista": interview.date
                        ? formatExportDate(interview.date)
                        : "",
                      nota: notes,
                    },
                  ]
                : [];
            })
          : [],
      ),
    };
  });

function formatExportDate(date: Date): string {
  return format(new TZDate(date, MONTEVIDEO_TIME_ZONE), EXPORT_DATE_FORMAT);
}

function extractNoteText(content: unknown): string | null {
  if (typeof content === "string") return content.trim() || null;
  if (!content || typeof content !== "object") return null;

  const lines: string[] = [];

  function inlineText(node: unknown): string {
    if (!node || typeof node !== "object") return "";
    const record = node as Record<string, unknown>;
    if (typeof record.text === "string") return record.text;
    if (record.type === "hardBreak") return "\n";
    return Array.isArray(record.content)
      ? record.content.map(inlineText).join("")
      : "";
  }

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const record = node as Record<string, unknown>;
    if (
      record.type === "paragraph" ||
      record.type === "heading" ||
      record.type === "listItem"
    ) {
      const text = inlineText(record).trim();
      if (text) lines.push(text);
      return;
    }
    if (Array.isArray(record.content)) record.content.forEach(walk);
  }

  walk(content);
  return (
    lines.length > 0 ? lines.join("\n") : inlineText(content).trim() || null
  );
}
