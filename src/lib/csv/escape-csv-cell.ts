const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@]/;

export function escapeCsvCell(value: string): string {
  const safeValue = SPREADSHEET_FORMULA_PREFIX.test(value.trimStart())
    ? `'${value}`
    : value;

  return `"${safeValue.replaceAll('"', '""')}"`;
}
