
import {
  EnglishLevel,
  HearAboutUs,
  Source,
} from "~/generated/prisma/enums";

function normalizeValue(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

export function mapImportSource(
  value: string | null,
): Source | null {
  if (!value) return null;

  switch (normalizeValue(value)) {
    case "inbound":
    case "portaldeempleo":
      return Source.Inbound;

    case "outbound":
      return Source.Outbound;

    case "referido":
    case "referral":
      return Source.Referral;

    default:
      return null;
  }
}

export function mapImportEnglishLevel(
  value: string | null,
): EnglishLevel | null {
  if (!value) return null;

  switch (normalizeValue(value)) {
    case "beginner":
    case "basic":
      return EnglishLevel.Basic;

    case "medium":
    case "intermediate":
      return EnglishLevel.Intermediate;

    case "advanced":
      return EnglishLevel.Advanced;

    case "native":
      return EnglishLevel.Native;

    default:
      return null;
  }
}

export function mapImportHearAboutUs(
  value: string | null,
): HearAboutUs | null {
  if (!value) return null;

  const mapping: Record<string, HearAboutUs> = {
    linkedinpost: HearAboutUs.LinkedInPost,
    linkedinjobs: HearAboutUs.LinkedInJobs,
    jobboard: HearAboutUs.JobBoard,
    referral: HearAboutUs.Referral,
    referido: HearAboutUs.Referral,
    airecommendation: HearAboutUs.AiRecommendation,
    internetsearch: HearAboutUs.InternetSearch,
    recruitercontact: HearAboutUs.RecruiterContact,
    other: HearAboutUs.Other,
  };

  return mapping[normalizeValue(value)] ?? HearAboutUs.Other;
}
