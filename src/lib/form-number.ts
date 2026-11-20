// Converts the raw text of a numeric input to a number so the zod schema can
// report invalid values (NaN) instead of the browser's native validation.
export function parseNumberInput<TEmpty extends undefined | null>(
  raw: unknown,
  emptyValue: TEmpty,
): number | TEmpty {
  const value = String(raw ?? "").trim();

  return value === "" ? emptyValue : Number(value);
}
