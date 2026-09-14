import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatActivityDate(date: Date) {
  return format(new TZDate(date, "America/Montevideo"), "dd MMM yyyy HH:mm", {
    locale: es,
  });
}
