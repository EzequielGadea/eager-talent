"use client";

import { useEffect } from "react";

import "./globals.css";

// Replaces the root layout when it fails, so it must render its own document.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-surface-subtle p-6 font-sans">
        <main className="w-full max-w-105 rounded-3xl border bg-surface-card p-8 text-center shadow-lg">
          <p className="text-label font-bold uppercase tracking-wider text-text-tertiary">
            {error.digest ? `Código ${error.digest}` : "Error 500"}
          </p>

          <h1 className="mt-1 text-h3 font-semibold text-text-primary">
            Algo salió mal
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Ocurrió un error inesperado. Intentá nuevamente y, si el problema
            persiste, contactá a tu equipo de soporte.
          </p>

          <button
            type="button"
            onClick={retry}
            className="mt-6 h-11 w-full cursor-pointer rounded-full border border-border-default bg-card text-sm font-medium text-text-primary hover:bg-surface-hover"
          >
            Intentar nuevamente
          </button>
        </main>
      </body>
    </html>
  );
}
