import { Suspense } from "react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { PipelineColumn } from "./pipeline-column";
import { PipelineColumnSkeleton } from "./pipeline-column-skeleton";
import type { PipelineStage } from "./types";

type PipelineProps = {
  jobOpeningId: string;
  stages: PipelineStage[];
};

export function Pipeline({ jobOpeningId, stages }: PipelineProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex min-w-max gap-4 pb-4">
        {stages.map((stage) => (
          <Suspense
            key={stage.name}
            fallback={<PipelineColumnSkeleton />}
          >
            <PipelineColumn
              jobOpeningId={jobOpeningId}
              stage={stage}
            />
          </Suspense>
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}