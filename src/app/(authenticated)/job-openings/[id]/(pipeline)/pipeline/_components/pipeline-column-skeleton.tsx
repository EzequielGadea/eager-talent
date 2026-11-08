import { Skeleton } from "~/components/ui/skeleton";

import { CandidateCardSkeleton } from "./candidate-card-skeleton";

export function PipelineColumnSkeleton() {
  return (
    <section className="flex w-full shrink-0 flex-col gap-3 border-t-4 border-border-default pt-3 sm:w-80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <CandidateCardSkeleton />
        <CandidateCardSkeleton />
        <CandidateCardSkeleton />
      </div>
    </section>
  );
}
