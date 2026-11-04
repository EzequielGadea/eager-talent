import { Skeleton } from "~/components/ui/skeleton";

export function UsersTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default bg-surface-card">
      <div className="border-b border-border-default bg-(--surface-subtle) px-4 py-3">
        <div className="flex items-center gap-8">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="divide-y divide-border-default">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-6 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>

            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto size-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
