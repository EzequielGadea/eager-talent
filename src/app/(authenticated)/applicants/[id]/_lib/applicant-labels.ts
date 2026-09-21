import type {
  EnglishLevel,
  HearAboutUs,
  Source,
} from "~/generated/prisma/enums";

export const englishLevelLabels: Record<EnglishLevel, string> = {
  Basic: "Básico",
  Intermediate: "Intermedio",
  Advanced: "Avanzado",
  Native: "Nativo",
};

export const sourceLabels: Record<Source, string> = {
  Inbound: "Postulación recibida",
  Outbound: "Búsqueda activa",
  Referral: "Referido",
};

export const hearAboutUsLabels: Record<HearAboutUs, string> = {
  LinkedInPost: "Publicación en LinkedIn",
  LinkedInJobs: "Empleos de LinkedIn",
  JobBoard: "Portal de empleo",
  Referral: "Recomendación de un contacto",
  AiRecommendation: "Recomendación de inteligencia artificial",
  InternetSearch: "Búsqueda en internet",
  RecruiterContact: "Contacto de un recruiter",
  Other: "Otro medio",
};
