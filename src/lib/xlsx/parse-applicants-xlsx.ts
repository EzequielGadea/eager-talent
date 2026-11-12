import * as XLSX from "xlsx";

import type {
  ImportedApplicant,
  ApplicantCsvParseResult,
} from "~/lib/csv/parse-applicants-csv";

type ApplicantField =
  | "email"
  | "phone"
  | "hearAboutUs"
  | "tags"
  | "country"
  | "englishLevel"
  | "source"
  | "title"
  | "fullName"
  | "seniority"
  | "role"
  | "linkedin"
  | "externalId";

const fields: Record<ApplicantField, string[]> = {
  email: ["Correo", "Email", "E-mail"],
  phone: [
    "Numero de telefono",
    "Número de teléfono",
    "Numeros de telefono",
    "Números de teléfono",
    "Phone",
    "Phone number",
  ],
  hearAboutUs: ["How did you Hear about us?"],
  tags: ["Habilidades", "Skills"],
  country: ["Ubicacion", "Ubicación", "Location"],
  englishLevel: ["English Level"],
  source: ["Fuente", "Source"],
  title: ["Academic career"],
  fullName: ["Nombre completo", "Full name", "Name"],
  seniority: ["Nivel de puesto", "Job level", "Seniority"],
  role: [
    "Posicion actual",
    "Posición actual",
    "Current position",
    "rol",
    "role",
  ],
  linkedin: ["Enlaces", "Links", "Link", "Enlace"],
  externalId: ["Identificación", "Identificacion"],
};

const requiredFields: ApplicantField[] = ["email", "fullName", "role"];

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function optionalValue(value: string): string | null {
  return value.trim() || null;
}

function splitFullName(fullName: string) {
  const [name = "", ...lastNameParts] = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    name,
    lastName: lastNameParts.join(" "),
  };
}

function parseTags(value: string): string[] {
  if (!value.trim()) return [];

  return [
    ...new Set(
      value
        .split(/[;|\n]+/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function parsePhone(value: string): string | null {
  if (!value.trim()) return null;

  return value.split(/[;,|\n]+/)[0]?.trim() || null;
}

function parseLinkedin(value: string): string | null {
  if (!value.trim()) return null;

  const links = value.split(/[\s;,|]+/).filter(Boolean);

  for (const link of links) {
    try {
      const normalizedLink = /^https?:\/\//i.test(link)
        ? link
        : `https://${link}`;

      const url = new URL(normalizedLink);
      const hostname = url.hostname.toLowerCase();

      const isLinkedin =
        hostname === "linkedin.com" || hostname === "www.linkedin.com";

      if (
        isLinkedin &&
        (url.protocol === "https:" || url.protocol === "http:")
      ) {
        return url.href;
      }
    } catch {
      // Ignore invalid URLs and continue searching.
    }
  }

  return null;
}

export async function parseApplicantXlsx(
  file: File,
): Promise<ApplicantCsvParseResult> {
  let workbook: XLSX.WorkBook;

  try {
    const buffer = await file.arrayBuffer();

    workbook = XLSX.read(buffer, {
      type: "array",
    });
  } catch {
    throw new Error("El archivo XLSX no es válido o no se puede leer.");
  }

  // Read the first worksheet.
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = firstSheetName
    ? workbook.Sheets[firstSheetName]
    : undefined;

  if (!firstSheet) {
    throw new Error("El archivo XLSX está vacío.");
  }

  // Read rows as arrays to preserve their original positions.
  const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: true,
  });

  const headers = (rows[0] ?? []).map(cellToString);

  const headerErrors: string[] = [];
  const normalizedHeaders = new Map<string, string[]>();

  // Detect duplicate headers.
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    const matches = normalizedHeaders.get(normalized) ?? [];

    matches.push(header);
    normalizedHeaders.set(normalized, matches);
  }

  for (const matches of normalizedHeaders.values()) {
    if (matches.length > 1) {
      headerErrors.push(`Encabezado duplicado: ${matches.join(", ")}.`);
    }
  }

  // Map Excel columns to applicant fields.
  const mapping: Partial<Record<ApplicantField, number>> = {};

  for (const [field, aliases] of Object.entries(fields)) {
    const matches = headers
      .map((header, index) => ({ header, index }))
      .filter(({ header }) =>
        aliases.some(
          (alias) => normalizeHeader(alias) === normalizeHeader(header),
        ),
      );

    if (matches.length > 1) {
      headerErrors.push(
        `Hay varias columnas para "${field}": ${matches
          .map(({ header }) => header)
          .join(", ")}.`,
      );
    } else if (matches.length === 1) {
      mapping[field as ApplicantField] = matches[0]!.index;
    }
  }

  const missingHeaders = requiredFields.filter(
    (field) => mapping[field] === undefined,
  );

  // Keep the same result structure as the CSV parser.
  if (headerErrors.length > 0 || missingHeaders.length > 0) {
    return {
      data: [],
      errors: [],
      headers,
      missingHeaders,
      headerErrors,
    };
  }

  const data: ImportedApplicant[] = [];

  // Row 1 contains headers, so data starts at index 1.
  for (let index = 1; index < rows.length; index++) {
    const row = rows[index] ?? [];

    // Ignore completely empty rows.
    if (row.every((cell) => cellToString(cell) === "")) {
      continue;
    }

    const getValue = (field: ApplicantField): string => {
      const columnIndex = mapping[field];

      return columnIndex === undefined ? "" : cellToString(row[columnIndex]);
    };

    const { name, lastName } = splitFullName(getValue("fullName"));

    data.push({
      rowNumber: index + 1,
      email: getValue("email"),
      name,
      lastName,
      role: getValue("role"),
      phone: parsePhone(getValue("phone")),
      hearAboutUs: optionalValue(getValue("hearAboutUs")),
      tags: parseTags(getValue("tags")),
      country: optionalValue(getValue("country")),
      englishLevel: optionalValue(getValue("englishLevel")),
      source: optionalValue(getValue("source")),
      title: optionalValue(getValue("title")),
      seniority: optionalValue(getValue("seniority")),
      linkedin: parseLinkedin(getValue("linkedin")),
      externalId: optionalValue(getValue("externalId")),
    });
  }

  return {
    data,
    errors: [],
    headers,
    missingHeaders: [],
    headerErrors: [],
  };
}
