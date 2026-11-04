import { Skeleton } from "~/components/ui/skeleton";

export function JobOpeningHeaderSkeleton() {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-56 min-w-0" />

            <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
          </div>

          <Skeleton className="mt-1 h-4 w-48 max-w-full" />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between sm:justify-end sm:gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
    </header>
  );
}
