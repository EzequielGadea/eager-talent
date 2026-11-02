import * as z from "zod";

export const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export const E164_MESSAGE =
  "El teléfono debe tener formato E.164 (ej. +59899000000)";

export const optionalE164PhoneSchema = z
  .string()
  .regex(E164_REGEX, E164_MESSAGE)
  .optional()
  .or(z.literal(""));
