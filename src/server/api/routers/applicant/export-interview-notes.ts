import { TZDate } from "@date-fns/tz";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { z } from "zod";

import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

const CSV_SEPARATOR = ";";
const CSV_HEADERS = [
  "applicant_id",
  "interview_id",
  "interview_date",
  "interviewer",
  "notes",
] as const;
const MONTEVIDEO_TIME_ZONE = "America/Montevideo";
const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@]/;

export const exportInterviewNotes = protectedProcedure
  .input(
    z.object({
      applicantId: z.string().min(1),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const [canReadApplicants, canReadInterviewNotes] = await Promise.all([
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { applicant: ["read"] } },
      }),
      auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions: { interviewNote: ["read"] } },
      }),
    ]);

    if (!canReadApplicants.success || !canReadInterviewNotes.success) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenés permiso para exportar notas de entrevistas",
      });
    }

    const applicant = await ctx.db.applicant.findFirst({
      where: {
        id: input.applicantId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        interviews: {
          where: {
            deletedAt: null,
            note: {
              is: { deletedAt: null },
            },
          },
          orderBy: [{ date: { sort: "desc", nulls: "last" } }, { id: "desc" }],
          select: {
            id: true,
            date: true,
            interviewers: {
              orderBy: [{ name: "asc" }, { lastName: "asc" }],
              select: {
                name: true,
                lastName: true,
              },
            },
            note: {
              select: { content: true },
            },
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

    const rows = applicant.interviews.flatMap((interview) => {
      const noteText = extractNoteText(interview.note?.content);
      if (!noteText) return [];

      return [
        [
          applicant.id,
          interview.id,
          interview.date
            ? format(
                new TZDate(interview.date, MONTEVIDEO_TIME_ZONE),
                "dd/MM/yyyy HH:mm",
              )
            : "",
          interview.interviewers
            .map(({ name, lastName }) => `${name} ${lastName}`.trim())
            .join(", "),
          noteText,
        ],
      ];
    });

    if (rows.length === 0) {
      return { status: "empty" as const };
    }

    const csv = [CSV_HEADERS, ...rows]
      .map((row) => row.map(escapeCsvCell).join(CSV_SEPARATOR))
      .join("\r\n");
    const candidateSlug = slugify(`${applicant.name}-${applicant.lastName}`);
    const currentDate = format(
      new TZDate(new Date(), MONTEVIDEO_TIME_ZONE),
      "yyyy-MM-dd",
    );

    return {
      status: "ready" as const,
      csv: `\uFEFF${csv}`,
      filename: `notas-${candidateSlug}-${currentDate}.csv`,
    };
  });

function escapeCsvCell(value: string): string {
  const safeValue = SPREADSHEET_FORMULA_PREFIX.test(value.trimStart())
    ? `'${value}`
    : value;

  return `"${safeValue.replaceAll('"', '""')}"`;
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "candidato"
  );
}

function extractNoteText(content: unknown): string | null {
  if (content == null) return null;

  if (typeof content === "string") {
    return content.trim() || null;
  }

  if (typeof content !== "object") return null;

  const lines: string[] = [];

  function extractInlineText(node: unknown): string {
    if (!node || typeof node !== "object") return "";

    const record = node as Record<string, unknown>;
    if (typeof record.text === "string") return record.text;
    if (record.type === "hardBreak") return "\n";
    if (!Array.isArray(record.content)) return "";

    return record.content.map(extractInlineText).join("");
  }

  function walkBlocks(node: unknown): void {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      node.forEach(walkBlocks);
      return;
    }

    const record = node as Record<string, unknown>;
    if (
      record.type === "paragraph" ||
      record.type === "heading" ||
      record.type === "listItem"
    ) {
      const text = extractInlineText(record).trim();
      if (text) lines.push(text);
      return;
    }

    if (Array.isArray(record.content)) {
      record.content.forEach(walkBlocks);
    }
  }

  walkBlocks(content);

  if (lines.length > 0) return lines.join("\n");

  return extractInlineText(content).trim() || null;
}
