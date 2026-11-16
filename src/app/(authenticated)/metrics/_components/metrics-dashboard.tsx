"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MetricsFilters } from "./metrics-filters";
import type { MetricsPeriod } from "~/lib/validations/metrics";

export function MetricsDashboard({
  areas,
  period,
  areaId,
  children,
}: {
  areas: Array<{ id: string; name: string }>;
  period: MetricsPeriod;
  areaId?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilters(next: {
    period?: MetricsPeriod;
    areaId?: string;
    clearArea?: boolean;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.period) params.set("period", next.period);
    if (next.clearArea) params.delete("areaId");
    else if (next.areaId) params.set("areaId", next.areaId);
    params.delete("page");
    params.delete("openingId");
    router.push(`?${params.toString()}`);
  }

  return (
    <section className="metrics-print flex flex-col gap-6 [&_[data-slot=card]]:rounded-lg">
      <style>{PRINT_STYLES}</style>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-balance text-h1 text-text-primary">
          Métricas
        </h1>
        <Button
          type="button"
          onClick={() => window.print()}
          className="print:hidden"
        >
          <Download aria-hidden="true" />
          Exportar a PDF
        </Button>
      </header>
      <MetricsFilters
        period={period}
        areaId={areaId}
        areas={areas}
        onPeriodChange={(value) => updateFilters({ period: value })}
        onAreaChange={(value) =>
          updateFilters(value ? { areaId: value } : { clearArea: true })
        }
      />
      {children}
    </section>
  );
}

const PRINT_STYLES = `
  @media print {
    @page { size: A4 landscape; margin: 10mm; }
    body { background: var(--surface-page); }
    body * { visibility: hidden; }
    .metrics-print .recharts-tooltip-wrapper { display: none !important; }
    .metrics-print, .metrics-print * { visibility: visible; }
    .metrics-print { position: absolute; top: 0; left: 0; width: 100%; gap: 6mm !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; zoom: 0.75; }
    .metrics-print > header { margin-bottom: 6mm; }
    .metrics-print > header + * { margin-bottom: 6mm; }
    .metrics-print [data-slot="card"] { background: var(--surface-card) !important; border: 1px solid var(--border-default) !important; box-shadow: none !important; break-inside: avoid; page-break-inside: avoid; margin-bottom: 3mm; }
    .metrics-print table { margin-top: 6mm !important; }
    .metrics-print [class*="overflow-"] { overflow: visible !important; }
    .metrics-print [class*="min-w-"] { min-width: 0 !important; }
  }
`;
