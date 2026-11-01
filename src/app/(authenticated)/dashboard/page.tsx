import { Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";

import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardMetrics } from "./_components/dashboard-metrics";
import { SelectionPipeline } from "./_components/selection-pipeline";
import { TodaysInterviews } from "./_components/todays-interviews";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardFallback() {
  return (
    <div role="status" className="flex flex-col gap-5">
      <span className="sr-only">Cargando dashboard</span>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}

async function DashboardContent() {
  const permission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        dashboard: ["read"],
      },
    },
  });

  if (!permission.success) {
    redirect("/job-openings");
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader />
      <DashboardMetrics />

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <SelectionPipeline />
        <TodaysInterviews />
      </div>
    </div>
  );
}
