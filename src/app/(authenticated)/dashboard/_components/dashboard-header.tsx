"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";

export function DashboardHeader() {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const date = format(
        new TZDate(Date.now(), "America/Montevideo"),
        "EEEE d 'de' MMMM, yyyy",
        { locale: es },
      );

      setFormattedDate(
        date.charAt(0).toLocaleUpperCase("es") + date.slice(1),
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <header>
      <h1 className="text-4xl leading-tight font-bold tracking-tight text-text-primary">
        Dashboard
      </h1>
      {formattedDate ? (
        <p className="mt-2 text-xl text-text-secondary">{formattedDate}</p>
      ) : (
        <div
          aria-label="Cargando fecha"
          className="mt-2 h-7 w-64 animate-pulse rounded-md bg-surface-sunken"
        />
      )}
    </header>
  );
}
