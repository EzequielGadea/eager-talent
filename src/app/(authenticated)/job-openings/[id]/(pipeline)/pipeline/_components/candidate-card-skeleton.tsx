import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function CandidateCardSkeleton() {
  return (
    <Card className="rounded-xl border-border-default bg-card p-3 shadow-none">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>

        <Skeleton className="size-8 shrink-0 rounded-md" />
      </div>
    </Card>
  );
}
