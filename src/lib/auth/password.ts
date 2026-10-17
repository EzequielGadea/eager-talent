import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `No puede superar los ${PASSWORD_MAX_LENGTH} caracteres`,
  )
  .regex(/\p{Lu}/u, "Debe incluir al menos una letra mayúscula")
  .regex(/\p{Ll}/u, "Debe incluir al menos una letra minúscula")
  .regex(/\p{N}/u, "Debe incluir al menos un número")
  .regex(
    /[^\p{L}\p{N}\s]/u,
    "Debe incluir al menos un símbolo (por ejemplo ! @ # $ %)",
  );
