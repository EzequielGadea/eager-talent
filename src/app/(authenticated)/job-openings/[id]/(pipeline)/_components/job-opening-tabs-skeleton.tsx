import { Skeleton } from "~/components/ui/skeleton";

export function JobOpeningTabsSkeleton() {
  return (
    <div className="border-b border-border-default">
      <div className="flex items-center justify-between gap-6 pb-3">
        <div className="flex items-center gap-6">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
