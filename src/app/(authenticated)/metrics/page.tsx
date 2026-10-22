import { Suspense } from "react";
import { notFound } from "next/navigation";

import Loading from "~/components/ui/loading";
import { api } from "~/lib/trpc/server";
import { MetricsDashboard } from "./_components/metrics-dashboard";

async function MetricsContent() {
  const user = await api.user.getCurrent();

  if (!user.role || !["recruiter", "admin", "owner"].includes(user.role)) {
    notFound();
  }

  const [summary, closedOpenings] = await Promise.all([
    api.metrics.getMetricsSummary(),
    api.metrics.getClosedOpenings(),
  ]);

  return <MetricsDashboard summary={summary} closedOpenings={closedOpenings} />;
}

export default function MetricsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MetricsContent />
    </Suspense>
  );
}
