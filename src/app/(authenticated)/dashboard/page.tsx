import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardMetrics } from "./_components/dashboard-metrics";
import { SelectionPipeline } from "./_components/selection-pipeline";
import { TodaysInterviews } from "./_components/todays-interviews";

export default function DashboardPage() {
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
