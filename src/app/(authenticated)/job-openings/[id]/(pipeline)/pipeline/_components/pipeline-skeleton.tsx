import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { PipelineColumnSkeleton } from "./pipeline-column-skeleton";

export function PipelineSkeleton() {
  return (
    <ScrollArea className="w-full">
      <div className="flex min-w-max gap-4 pb-4">
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
