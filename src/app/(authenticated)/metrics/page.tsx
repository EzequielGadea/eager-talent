import { Suspense } from "react";
import { notFound } from "next/navigation";

import Loading from "~/components/ui/loading";
import { api } from "~/lib/trpc/server";
import { defaultMetricsPeriod } from "~/lib/validations/metrics";
import { MetricsDashboard } from "./_components/metrics-dashboard";

async function MetricsContent() {
  const user = await api.user.getCurrent();

  if (!user.role || !["recruiter", "admin", "owner"].includes(user.role)) {
    notFound();
  }

  const defaultFilters = { period: defaultMetricsPeriod };
  const [summary, closedOpenings, timeMetrics, deviations, areas] =
    await Promise.all([
      api.metrics.getMetricsSummary(defaultFilters),
      api.metrics.getClosedOpenings(defaultFilters),
      api.metrics.getTimeMetrics(defaultFilters),
      api.metrics.getJobOpeningDeviations({ ...defaultFilters, page: 1 }),
      api.area.getAllAreas({}),
    ]);

  return (
    <MetricsDashboard
      initialSummary={summary}
      initialClosedOpenings={closedOpenings}
      initialTimeMetrics={timeMetrics}
      initialDeviations={deviations}
      areas={areas.map(({ id, name }) => ({ id, name }))}
    />
  );
}

export default function MetricsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MetricsContent />
    </Suspense>
  );
}
