import { PipelineColumnSkeleton } from "./pipeline-column-skeleton";

export function PipelineSkeleton() {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-col gap-4 pb-4 sm:min-w-max sm:flex-row">
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
      </div>
    </div>
  );
}
