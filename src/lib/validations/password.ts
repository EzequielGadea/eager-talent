export const passwordRules = [
  {
    id: "length",
    label: "Mínimo 8 caracteres",
    message: "Usá al menos 8 caracteres",
    test: (v: string) => v.length >= 8,
  },
  {
    id: "upper",
    label: "Una mayúscula",
    message: "Incluí al menos una mayúscula",
    test: (v: string) => /\p{Lu}/u.test(v),
  },
  {
    id: "lower",
    label: "Una minúscula",
    message: "Incluí al menos una minúscula",
    test: (v: string) => /\p{Ll}/u.test(v),
  },
  {
    id: "number",
    label: "Un número",
    message: "Incluí al menos un número",
    test: (v: string) => /\p{N}/u.test(v),
  },
  {
    id: "symbol",
    label: "Un símbolo (ej: ! @ # $ %)",
    message: "Incluí al menos un símbolo",
    test: (v: string) => /[^\p{L}\p{N}\s]/u.test(v),
  },
];
