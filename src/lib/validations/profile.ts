import * as z from "zod";

const NAME_REGEX = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(60, `${label} no puede superar los 60 caracteres`)
    .regex(
      NAME_REGEX,
      `${label} solo puede contener letras, espacios, guiones y apóstrofes`,
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
  image: z.string().nullable().optional(),
});
