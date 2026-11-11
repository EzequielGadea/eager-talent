import Papa from "papaparse";

export type ImportedApplicant = {
  rowNumber: number;
  email: string;
  name: string;
  lastName: string;
  role: string;
  phone: string | null;
  hearAboutUs: string | null;
  tags: string[];
  country: string | null;
  englishLevel: string | null;
  source: string | null;
  title: string | null;
  seniority: string | null;
  linkedin: string | null;
  externalId: string | null;
};

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

export type ApplicantCsvParseResult = {
  data: ImportedApplicant[];
  errors: Papa.ParseError[];
  headers: string[];
  missingHeaders: string[];
  headerErrors: string[];
};

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
  role: ["Posicion actual", "Posición actual", "Current position", "rol", "role"],
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

function optionalValue(value?: string): string | null {
  return value?.trim() || null;
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

function parseTags(value?: string): string[] {
  if (!value?.trim()) return [];

  return [
    ...new Set(
      value
        .split(/[;|\n]+/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function parsePhone(value?: string): string | null {
  if (!value?.trim()) return null;

  return value.split(/[;,|\n]+/)[0]?.trim() || null;
}

/**
 * Finds the first LinkedIn URL in a cell.
 * Accepts URLs with or without http(s)://.
 * Ignores URLs from other domains.
 */
function parseLinkedin(value?: string): string | null {
  if (!value?.trim()) return null;

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

/**
 * Returns the physical starting line of each non-empty CSV record.
 * Handles quoted fields, escaped quotes and embedded line breaks.
 */
function getRecordStartLines(csv: string, delimiter: string): number[] {
  const lines: number[] = [];

  let lineNumber = 1;
  let recordStart = 1;
  let inQuotes = false;
  let atFieldStart = true;
  let recordHasContent = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];

    if (char === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        // An escaped quote is field content; opening and closing quotes are not.
        recordHasContent = true;
        i++;
      } else if (inQuotes) {
        inQuotes = false;
      } else if (atFieldStart) {
        inQuotes = true;
      }

      atFieldStart = false;
      continue;
    }

    if (!inQuotes && char === delimiter) {
      atFieldStart = true;
      continue;
    }

    if (char === "\r" || char === "\n") {
      if (char === "\r" && csv[i + 1] === "\n") {
        i++;
      }

      if (!inQuotes) {
        if (recordHasContent) {
          lines.push(recordStart);
        }

        lineNumber++;
        recordStart = lineNumber;
        recordHasContent = false;
        atFieldStart = true;
      } else {
        lineNumber++;
      }

      continue;
    }

    if (!/\s/.test(char)) {
      recordHasContent = true;
    }

    if (atFieldStart && !/\s/.test(char)) {
      atFieldStart = false;
    }
  }

  if (recordHasContent) {
    lines.push(recordStart);
  }

  return lines;
}

export async function parseApplicantCsv(
  input: File | string,
): Promise<ApplicantCsvParseResult> {
  const csv = typeof input === "string" ? input : await input.text();

  // First pass: read original headers without Papa Parse
  // automatically renaming duplicate column names.
  const headerParse = Papa.parse<string[]>(csv, {
    header: false,
    preview: 1,
    skipEmptyLines: "greedy",
  });

  const originalHeaders = headerParse.data[0] ?? [];
  const headers = originalHeaders.map((header) =>
    header.replace(/^\uFEFF/, "").trim(),
  );

  const headerErrors: string[] = [];

  // Detect duplicate headers after normalization.
  const normalizedHeaders = new Map<string, string[]>();

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

  // Map CSV headers to EagerTalent fields.
  const mapping: Partial<Record<ApplicantField, string>> = {};

  for (const [field, aliases] of Object.entries(fields)) {
    const matches = headers.filter((header) =>
      aliases.some(
        (alias) => normalizeHeader(alias) === normalizeHeader(header),
      ),
    );

    if (matches.length > 1) {
      headerErrors.push(
        `Hay varias columnas para "${field}": ${matches.join(", ")}.`,
      );
    } else if (matches.length === 1) {
      mapping[field as ApplicantField] = matches[0];
    }
  }

  const missingHeaders = requiredFields.filter((field) => !mapping[field]);

  // Do not process rows when headers are invalid.
  if (headerErrors.length > 0 || missingHeaders.length > 0) {
    return {
      data: [],
      errors: headerParse.errors,
      headers,
      missingHeaders,
      headerErrors,
    };
  }

  // Second pass: parse rows using the detected headers.
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim(),
  });

  // Structural parsing errors prevent importing the file.
  if (parsed.errors.length > 0) {
    return {
      data: [],
      errors: parsed.errors,
      headers,
      missingHeaders: [],
      headerErrors: [],
    };
  }

  const delimiter = parsed.meta.delimiter || ",";
  const recordLines = getRecordStartLines(csv, delimiter);
  const dataLines = recordLines.slice(1);

  const data: ImportedApplicant[] = parsed.data.map((row, index) => {
    const getValue = (field: ApplicantField): string => {
      const header = mapping[field];
      return header ? (row[header] ?? "").trim() : "";
    };

    const { name, lastName } = splitFullName(getValue("fullName"));

    return {
      rowNumber: dataLines[index] ?? index + 2,
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
    };
  });

  return {
    data,
    errors: [],
    headers,
    missingHeaders: [],
    headerErrors: [],
  };
}
