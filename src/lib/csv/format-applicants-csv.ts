import type {
  EnglishLevel,
  HearAboutUs,
  Source,
} from "~/generated/prisma/enums";

export type ExportableApplicant = {
  name: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  linkedin: string | null;
  englishLevel: EnglishLevel | null;
  source: Source | null;
  hearAboutUs: HearAboutUs | null;
  title: string | null;
  role: {
    name: string;
  };
  seniority: {
    name: string;
  } | null;
  tags: {
    name: string;
  }[];
};

export const APPLICANT_CSV_HEADERS = [
  "Nombre completo",
  "Correo",
  "Número de teléfono",
  "Posición actual",
  "Nivel de puesto",
  "Habilidades",
  "Ubicación",
  "Enlaces",
  "English Level",
  "Fuente",
  "How did you Hear about us?",
  "Academic career",
] as const;

function escapeCsvCell(value: string | null | undefined): string {
  const normalized = (value ?? "").trim();

  if (/[",;|\r\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

export function formatApplicantsCsv(applicants: ExportableApplicant[]): string {
  const headerRow = APPLICANT_CSV_HEADERS.map(escapeCsvCell).join(",");

  const dataRows = applicants.map((applicant) => {
    const fullName = [applicant.name.trim(), applicant.lastName.trim()]
      .filter(Boolean)
      .join(" ");
    const tags = applicant.tags
      .map((tag) => tag.name.trim())
      .filter(Boolean)
      .join(";");

    const rowValues = [
      fullName,
      applicant.email,
      applicant.phone,
      applicant.role.name,
      applicant.seniority?.name,
      tags,
      applicant.country,
      applicant.linkedin,
      applicant.englishLevel,
      applicant.source,
      applicant.hearAboutUs,
      applicant.title,
    ];

    return rowValues.map(escapeCsvCell).join(",");
  });

  return [headerRow, ...dataRows].join("\r\n");
}
