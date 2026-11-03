import Papa from "papaparse";

/** Applicant fields retained from the recruitment export CSV. */
export type ImportedApplicant = {
  email: string;
  phone: string;
  hearAboutUs: string;
  skills: string;
  location: string;
  englishLevel: string;
  source: string;
  academicCareer: string;
  fullName: string;
  jobLevel: string;
  currentPosition: string;
  links: string;
  id: string;
};

export type ApplicantCsvParseResult = {
  data: ImportedApplicant[];
  errors: Papa.ParseError[];
  headers: string[];
  missingHeaders: string[];
};

const fields = {
  email: ["Correo", "Email", "E-mail"],
  phone: ["Numero de telefono", "Número de teléfono", "Phone", "Phone number"],
  hearAboutUs: ["How did you Hear about us?"],
  skills: ["Habilidades", "Skills"],
  location: ["Ubicacion", "Ubicación", "Location"],
  englishLevel: ["English Level"],
  source: ["Fuente", "Source"],
  academicCareer: ["academic career", "Academic career", "Academic Career"],
  fullName: ["nombre completo", "Nombre completo", "Full name", "Name"],
  jobLevel: ["Nivel de puesto", "Job level", "Seniority"],
  currentPosition: ["Posicion actual", "Posición actual", "Current position"],
  links: ["Enlaces", "Links"],
  id: ["Identificación", "Identificacion"],
} satisfies Record<keyof ImportedApplicant, string[]>;

const normalizeHeader = (header: string) =>
  header
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();

/** Parse a CSV file or its text contents and keep only the requested applicant fields. */
export async function parseApplicantCsv(
  input: File | string,
): Promise<ApplicantCsvParseResult> {
  const csv = typeof input === "string" ? input : await input.text();
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });
  const headers = parsed.meta.fields ?? [];
  const normalizedHeaders = new Map(
    headers.map((header) => [normalizeHeader(header), header]),
  );
  const mapping = Object.fromEntries(
    Object.entries(fields).map(([field, aliases]) => [
      field,
      aliases
        .map(normalizeHeader)
        .map((alias) => normalizedHeaders.get(alias))
        .find(Boolean),
    ]),
  ) as Partial<Record<keyof ImportedApplicant, string>>;

  const data = parsed.data.map(
    (row) =>
      Object.fromEntries(
        Object.keys(fields).map((field) => {
          const sourceHeader = mapping[field as keyof ImportedApplicant];
          return [field, sourceHeader ? (row[sourceHeader] ?? "").trim() : ""];
        }),
      ) as ImportedApplicant,
  );

  return {
    data,
    errors: parsed.errors,
    headers,
    missingHeaders: Object.keys(fields).filter(
      (field) => !mapping[field as keyof ImportedApplicant],
    ),
  };
}
