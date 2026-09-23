import { JobOpeningHeaderSkeleton } from "./job-opening-header-skeleton";
import { JobOpeningTabsSkeleton } from "./job-opening-tabs-skeleton";

export function JobOpeningLayoutSkeleton() {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 p-6">
      <JobOpeningHeaderSkeleton />
      <JobOpeningTabsSkeleton />
    </main>
  );
}