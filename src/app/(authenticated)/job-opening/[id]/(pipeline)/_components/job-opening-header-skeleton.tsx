import { Skeleton } from "~/components/ui/skeleton";

export function JobOpeningHeaderSkeleton() {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-md" />

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-56" />

            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <Skeleton className="mt-1 h-4 w-48" />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>
    </header>
  );
}
