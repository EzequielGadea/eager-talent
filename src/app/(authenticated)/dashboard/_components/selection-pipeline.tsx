import { PipelineIcon } from "../../_components/app-icons";

function PipelineRowPlaceholder() {
  return (
    <div className="grid grid-cols-[minmax(90px,150px)_1fr_32px] items-center gap-2.5">
      <div className="h-3 w-24 max-w-full rounded-full bg-slate-200" />

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-2/3 rounded-full bg-slate-200" />
      </div>

      <div className="ml-auto h-3 w-6 rounded-full bg-slate-200" />
    </div>
  );
}

export function SelectionPipeline() {
  return (
    <section
      aria-label="Pipeline de selección"
      aria-busy="true"
      className="rounded-lg border border-border-default bg-white p-5 shadow-sm"
    >
      <header className="mb-4.5 flex items-center gap-2">
        <PipelineIcon
          className="size-4.5 text-text-secondary"
          aria-hidden="true"
        />

        <h2 className="text-[15px] font-semibold text-text-primary">
          Pipeline de selección
        </h2>
      </header>

      <div className="flex flex-col gap-3">
        <PipelineRowPlaceholder />
        <PipelineRowPlaceholder />
        <PipelineRowPlaceholder />
        <PipelineRowPlaceholder />
        <PipelineRowPlaceholder />
        <PipelineRowPlaceholder />
      </div>
    </section>
  );
}
