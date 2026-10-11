import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const NO_APPLICATION_LABEL = "Base de Talentos";

export function formatInterviewDate(date: Date, { withTime = false } = {}) {
  return format(
    new TZDate(date, "America/Montevideo"),
    withTime ? "d MMM yyyy · HH:mm" : "d MMM yyyy",
    { locale: es },
  );
}
