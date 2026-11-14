import { z } from "zod";

import { paises } from "~/lib/countries";

const NAME_REGEX = /^\p{L}[\p{L} '’.-]*$/u;

function hostOf(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export const applicantNameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(60, `${label} no puede superar los 60 caracteres`)
    .regex(NAME_REGEX, `${label} contiene caracteres inválidos`);

export const applicantEmailSchema = z
  .string()
  .trim()
  .min(1, "El correo es obligatorio")
  .max(254, "El correo es demasiado largo")
  .pipe(z.email("Correo inválido"));

export const applicantCountrySchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || paises.some((pais) => pais.nombre === value),
    "País inválido",
  );

export const applicantLinkedinSchema = z
  .string()
  .trim()
  .max(300, "La URL de LinkedIn es demasiado larga")
  .pipe(z.httpUrl("Debe ingresar una URL válida"))
  .refine((value) => {
    const host = hostOf(value);
    return host === "linkedin.com" || host === "www.linkedin.com";
  }, "Debe ingresar una URL de LinkedIn válida")
  .or(z.literal(""));

export const shortTextSchema = (label: string, max: number) =>
  z.string().trim().max(max, `${label} no puede superar ${max} caracteres`);

export const careerYearSchema = z.number().int().min(1900).max(2100);

export const availabilitySchema = shortTextSchema("La disponibilidad", 100);

export const desiredSalarySchema = z.number().positive().max(1_000_000_000);

export const applicantTagIdsSchema = z
  .array(z.string().min(1))
  .max(50)
  .transform((ids) => [...new Set(ids)]);

export function validateCareerYears(
  data: { careerStartYear?: number | null; careerEndYear?: number | null },
  ctx: z.RefinementCtx,
) {
  if (
    data.careerStartYear != null &&
    data.careerEndYear != null &&
    data.careerEndYear < data.careerStartYear
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["careerEndYear"],
      message: "El año de fin no puede ser anterior al de inicio",
    });
  }
}
