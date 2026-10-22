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
