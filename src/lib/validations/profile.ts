import * as z from "zod";

const NAME_REGEX = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;
const CONSECUTIVE_SEPARATORS_REGEX = /[ '’-]{2}/u;

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(60, `${label} no puede superar los 60 caracteres`)
    .refine(
      (value) => !/^[ '’-]/u.test(value),
      `${label} no puede comenzar con un guion o apóstrofe`,
    )
    .refine(
      (value) => !/[ '’-]$/u.test(value),
      `${label} no puede terminar con un guion o apóstrofe`,
    )
    .refine(
      (value) => !CONSECUTIVE_SEPARATORS_REGEX.test(value),
      `${label} no puede contener separadores consecutivos`,
    )
    .regex(
      NAME_REGEX,
      `${label} solo puede contener letras, espacios, guiones y apóstrofes entre palabras`,
    );

export const profileSchema = z.object({
  name: nameField("El nombre"),
  lastName: nameField("El apellido"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const profileImageSchema = z
  .file()
  .max(4 * 1024 * 1024, "La imagen no puede superar los 4 MB.")
  .mime(
    ["image/jpeg", "image/png", "image/webp", "image/gif"],
    "Seleccioná una imagen JPEG, PNG, WebP o GIF.",
  );

export const updateProfileSchema = profileSchema.extend({
  image: z.httpUrl("La imagen debe ser una URL válida.").nullable().optional(),
});
