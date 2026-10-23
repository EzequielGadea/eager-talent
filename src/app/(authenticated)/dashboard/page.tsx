import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardMetrics } from "./_components/dashboard-metrics";
import { SelectionPipeline } from "./_components/selection-pipeline";
import { TodaysInterviews } from "./_components/todays-interviews";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const requestHeaders = await headers();

  const permission = await auth.api.hasPermission({
    headers: requestHeaders,
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
