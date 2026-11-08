import { DashboardActiveJobOpening } from "./dashboard-active-job-opening";
import { DashboardInterviews } from "./dashboard-interviews";

export function DashboardMetrics() {
  return (
    <section
      aria-label="Indicadores principales"
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <DashboardActiveJobOpening />
      <DashboardInterviews />
    </section>
  );
}
