import { Skeleton } from "~/components/ui/skeleton";

export function JobOpeningTabsSkeleton() {
  return (
    <div className="border-b border-border-default">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Skeleton className="h-5 w-16 sm:w-20" />
          <Skeleton className="h-5 w-24 sm:w-28" />
        </div>

        <Skeleton className="h-8 w-24 shrink-0 rounded-lg sm:w-48" />
      </div>
    </div>
  );
}
