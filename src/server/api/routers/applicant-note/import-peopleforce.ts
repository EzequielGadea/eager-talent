import { TRPCError } from "@trpc/server";
import Papa from "papaparse";
import { readSheet, type SheetData } from "read-excel-file/node";
import { z } from "zod";
import { Prisma } from "~/generated/prisma/client";
import { auth } from "~/lib/auth";
import { protectedProcedure } from "~/server/api/trpc";

const REQUIRED_COLUMNS = [
  "Identificación",
  "Nombre",
  "Creado por",
  "Creado a las",
  "Notas",
] as const;

const importedNoteSchema = z.object({
  identification: z.string().min(1),
  name: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  content: z.string().min(1),
});

const MAX_IMPORT_ROWS = 10_000;
const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TRANSACTION_RETRIES = 3;
const importedNotesSchema = z
  .array(importedNoteSchema)
  .min(1)
  .max(MAX_IMPORT_ROWS, "El archivo no puede contener más de 10.000 notas");

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function parseRows(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo no contiene filas",
    });
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo no puede contener más de 10.000 filas",
    });
  }

  let skippedWithoutIdentification = 0;
  const skippedWithoutIdentificationNames: string[] = [];
  const notes = rows.flatMap((row) => {
    const identification = cellToString(row["Identificación"]);
    const content = cellToString(row["Notas"]);
    if (!identification) {
      skippedWithoutIdentification++;
      const name = cellToString(row["Nombre"]);
      if (name) skippedWithoutIdentificationNames.push(name);
      return [];
    }
    if (!content) return [];
    return [
      {
        identification,
        name: cellToString(row["Nombre"]),
        createdBy: cellToString(row["Creado por"]),
        createdAt: cellToString(row["Creado a las"]),
        content,
      },
    ];
  });

  return {
    notes,
    skippedWithoutIdentification,
    skippedWithoutIdentificationNames,
  };
}

function validateColumns(columns: unknown[]) {
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !columns.some((value) => cellToString(value) === column),
  );

  if (missingColumns.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Faltan columnas requeridas: ${missingColumns.join(", ")}`,
    });
  }
}

function parseCsv(buffer: Buffer) {
  const parsed = Papa.parse<Record<string, string>>(buffer.toString("utf8"), {
    header: true,
    delimiter: "",
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim(),
  });

  if (parsed.errors.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo CSV no se puede leer. Verificá su formato.",
    });
  }

  validateColumns(parsed.meta.fields ?? []);
  return parseRows(parsed.data);
}

async function parseXlsx(buffer: Buffer) {
  let data: SheetData<number | Date>;
  try {
    data = await readSheet(buffer, { trim: true });
  } catch {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo no es un XLSX válido o no se puede leer",
    });
  }

  const [headerRow, ...dataRows] = data;
  if (!headerRow) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo está vacío",
    });
  }

  const columns = headerRow.map(cellToString);
  validateColumns(columns);
  const rows = dataRows.map((row) =>
    Object.fromEntries(
      columns.map((column, index) => [column, row[index] ?? ""]),
    ),
  );
  return parseRows(rows);
}

async function parsePeopleForceFile(base64: string, fileName: string) {
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El contenido del archivo no es válido",
    });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_IMPORT_FILE_BYTES) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo no puede superar los 10 MB",
    });
  }
  const extension = fileName.toLowerCase().split(".").pop();
  const isXlsx = extension === "xlsx";
  const isCsv = extension === "csv";
  const isZip = buffer
    .subarray(0, 4)
    .equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));

  if (!isXlsx && !isCsv) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo debe tener formato CSV o XLSX",
    });
  }

  if (isXlsx && !isZip) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo XLSX no es válido o está dañado",
    });
  }

  if (isCsv && isZip) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "La extensión del archivo no coincide con su contenido",
    });
  }

  if (isXlsx) {
    return parseXlsx(buffer);
  }

  if (buffer.includes(0)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo CSV no es un archivo de texto válido",
    });
  }

  const csvText = buffer.toString("utf8");
  if (Buffer.from(csvText, "utf8").compare(buffer) !== 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El archivo CSV no usa una codificación de texto válida",
    });
  }

  return parseCsv(buffer);
}

async function assertImportPermission(ctx: { headers: Headers }) {
  const permission = await auth.api.hasPermission({
    headers: ctx.headers,
    body: { permissions: { applicantNote: ["create", "update"] } },
  });
  if (!permission.success) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tenés permiso para importar notas de candidatos",
    });
  }
}

export const previewPeopleForceNotesProcedure = protectedProcedure
  .input(
    z.object({
      file: z.string().min(1).max(15_000_000),
      fileName: z.string().trim().min(1).max(255),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    await assertImportPermission(ctx);
    const parsed = await parsePeopleForceFile(input.file, input.fileName);
    const identifications = [
      ...new Set(parsed.notes.map((note) => note.identification)),
    ];
    const applicants = await ctx.db.applicant.findMany({
      where: { peopleForceID: { in: identifications }, deletedAt: null },
      select: {
        id: true,
        peopleForceID: true,
        name: true,
        lastName: true,
        note: { select: { id: true } },
      },
    });
    const applicantByPeopleForceId = new Map(
      applicants.map((applicant) => [applicant.peopleForceID!, applicant]),
    );
    const matchedNotes = parsed.notes.filter((note) =>
      applicantByPeopleForceId.has(note.identification),
    );
    const existingNoteApplicants = applicants
      .filter((applicant) => applicant.note)
      .map((applicant) => `${applicant.name} ${applicant.lastName}`.trim());
    const omittedApplicantNames = [
      ...new Set([
        ...parsed.notes
          .filter((note) => !applicantByPeopleForceId.has(note.identification))
          .map((note) => note.name || "Sin nombre"),
        ...parsed.skippedWithoutIdentificationNames.map(
          (name) => `${name} (sin identificación)`,
        ),
      ]),
    ];

    return {
      notes: matchedNotes,
      matchedApplicants: new Set(
        matchedNotes.map((note) => note.identification),
      ).size,
      notesToImport: matchedNotes.length,
      omittedApplicants: identifications.filter(
        (identification) => !applicantByPeopleForceId.has(identification),
      ).length,
      skippedWithoutIdentification: parsed.skippedWithoutIdentification,
      omittedApplicantNames,
      existingNoteApplicants,
    };
  });

export const importPeopleForceNotesProcedure = protectedProcedure
  .input(z.object({ notes: importedNotesSchema }))
  .mutation(async ({ ctx, input }) => {
    await assertImportPermission(ctx);
    const identifications = [
      ...new Set(input.notes.map((note) => note.identification)),
    ];

    const importNotes = () =>
      ctx.db.$transaction(
        async (tx) => {
          const applicants = await tx.applicant.findMany({
            where: { peopleForceID: { in: identifications }, deletedAt: null },
            select: {
              id: true,
              peopleForceID: true,
              note: { select: { content: true } },
            },
          });
          const applicantByPeopleForceId = new Map(
            applicants.map((applicant) => [
              applicant.peopleForceID!,
              applicant,
            ]),
          );
          const applicantById = new Map(
            applicants.map((applicant) => [applicant.id, applicant]),
          );
          const notesByApplicant = new Map<
            string,
            (typeof input.notes)[number][]
          >();
          for (const note of input.notes) {
            const applicant = applicantByPeopleForceId.get(note.identification);
            if (!applicant) continue;
            const current = notesByApplicant.get(applicant.id) ?? [];
            current.push(note);
            notesByApplicant.set(applicant.id, current);
          }

          const noteWrites = [...notesByApplicant].map(
            ([applicantId, notes]) => {
              const applicant = applicantById.get(applicantId)!;
              const importedNodes = notes.map((note) => ({
                type: "paragraph",
                attrs: { textAlign: null },
                content: [
                  {
                    type: "text",
                    text: `[PeopleForce] ${note.content}\nCreado por: ${note.createdBy || "Sin especificar"} · Creado a las: ${note.createdAt || "Sin especificar"}`,
                  },
                ],
              }));
              const previous =
                applicant.note?.content &&
                typeof applicant.note.content === "object" &&
                !Array.isArray(applicant.note.content)
                  ? (applicant.note.content as {
                      type?: string;
                      content?: unknown[];
                    })
                  : null;
              const content = {
                type: "doc",
                content: [...(previous?.content ?? []), ...importedNodes],
              } as Prisma.InputJsonValue;

              return { applicant, applicantId, content, notes };
            },
          );
          const newNotes = noteWrites.filter(
            ({ applicant }) => !applicant.note,
          );
          const existingNotes = noteWrites.filter(
            ({ applicant }) => applicant.note,
          );

          if (existingNotes.length > 0) {
            await tx.$executeRaw(
              Prisma.sql`
                UPDATE "applicant_note" AS note
                SET
                  "content" = updates."content"::jsonb,
                  "last_modified" = CURRENT_TIMESTAMP,
                  "last_modified_by_id" = ${ctx.session.user.id},
                  "deleted_at" = NULL
                FROM (
                  VALUES ${Prisma.join(
                    existingNotes.map(
                      ({ applicantId, content }) =>
                        Prisma.sql`(${applicantId}, ${JSON.stringify(content)})`,
                    ),
                  )}
                ) AS updates("applicant_id", "content")
                WHERE note."applicant_id" = updates."applicant_id"
              `,
            );
          }

          if (newNotes.length > 0) {
            await tx.applicantNote.createMany({
              data: newNotes.map(({ applicantId, content }) => ({
                applicantId,
                content,
                lastModifiedById: ctx.session.user.id,
              })),
            });
          }

          if (noteWrites.length > 0) {
            await tx.activity.createMany({
              data: noteWrites.map(({ applicantId, notes }) => ({
                applicantId,
                jobOpeningId: null,
                createdById: ctx.session.user.id,
                description: `importó ${notes.length} nota${notes.length === 1 ? "" : "s"} de PeopleForce`,
              })),
            });
          }

          return {
            importedNotes: [...notesByApplicant.values()].reduce(
              (total, notes) => total + notes.length,
              0,
            ),
            reachedApplicants: notesByApplicant.size,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

    for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt++) {
      try {
        return await importNotes();
      } catch (error) {
        const isSerializationConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034";
        if (!isSerializationConflict || attempt === MAX_TRANSACTION_RETRIES) {
          throw error;
        }
      }
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudo completar la importación",
    });
  });
