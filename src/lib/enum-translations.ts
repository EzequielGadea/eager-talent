import type {
  EnglishLevel,
  HearAboutUs,
  InterviewStatus,
  InterviewType,
  JobOpeningStatus,
  SalaryCurrency,
  Source,
} from "~/generated/prisma/enums";

export const englishLevelTranslations = {
  Basic: "Básico",
  Intermediate: "Intermedio",
  Advanced: "Avanzado",
  Native: "Nativo",
} satisfies Record<EnglishLevel, string>;

export const sourceTranslations = {
  Inbound: "Entrante",
  Outbound: "Saliente",
  Referral: "Referido",
} satisfies Record<Source, string>;

export const hearAboutUsTranslations = {
  LinkedInPost: "Publicación en LinkedIn",
  LinkedInJobs: "LinkedIn Empleos",
  JobBoard: "Portal de empleo",
  Referral: "Referido",
  AiRecommendation: "Recomendación de IA",
  InternetSearch: "Búsqueda en internet",
  RecruiterContact: "Contacto de un reclutador",
  Other: "Otro",
} satisfies Record<HearAboutUs, string>;

export const jobOpeningStatusTranslations = {
  Open: "Abierta",
  Paused: "Pausada",
  Closed: "Cerrada",
  Cancelled: "Cancelada",
} satisfies Record<JobOpeningStatus, string>;

export const interviewStatusTranslations = {
  Completed: "Completada",
  Scheduled: "Programada",
  Pending: "Pendiente",
} satisfies Record<InterviewStatus, string>;

export const interviewTypeTranslations = {
  VideoCall: "Videollamada",
  InPerson: "Presencial",
} satisfies Record<InterviewType, string>;

export const salaryCurrencyTranslations = {
  USD: "USD",
  UYU: "UYU",
} satisfies Record<SalaryCurrency, string>;
