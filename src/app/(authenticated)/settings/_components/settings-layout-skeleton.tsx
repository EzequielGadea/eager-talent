import { Skeleton } from "~/components/ui/skeleton";

export function SettingsLayoutSkeleton() {
  return (
    <main className="flex flex-col gap-6">
      <Skeleton className="h-9 w-48" />

      <div className="flex gap-6 border-b border-border-default pb-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>

      <Skeleton className="h-64 w-full rounded-xl" />
    </main>
  );
}
