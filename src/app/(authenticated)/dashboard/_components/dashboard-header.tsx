import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";
import { connection } from "next/server";

export async function DashboardHeader() {
  await connection();

  const formattedDate = format(
    new TZDate(Date.now(), "America/Montevideo"),
    "EEEE d 'de' MMMM, yyyy",
    { locale: es },
  );
  const capitalizedDate =
    formattedDate.charAt(0).toLocaleUpperCase("es") + formattedDate.slice(1);

  return (
    <header>
      <h1 className="text-4xl leading-tight font-bold tracking-tight text-text-primary">
        Dashboard
      </h1>
      <p className="mt-2 text-xl text-text-secondary">{capitalizedDate}</p>
    </header>
  );
}

export function DashboardHeaderFallback() {
  return (
    <header>
      <h1 className="text-4xl leading-tight font-bold tracking-tight text-text-primary">
        Dashboard
      </h1>
      <div
        aria-label="Cargando fecha"
        className="mt-2 h-7 w-64 animate-pulse rounded-md bg-surface-sunken"
      />
    </header>
  );
}
