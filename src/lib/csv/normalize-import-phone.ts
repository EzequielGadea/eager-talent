
import { optionalE164PhoneSchema } from "~/lib/validations/phone";

export function normalizeImportPhone(
  phone: string | null,
): string | null {
  if (!phone) return null;

  const normalized = phone.replace(/[\s-]/g, "");

  const result = optionalE164PhoneSchema.safeParse(normalized);

  if (!result.success || !result.data) {
    return null;
  }

  return result.data;
}
