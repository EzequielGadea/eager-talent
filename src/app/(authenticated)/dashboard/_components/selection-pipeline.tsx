"use client";

import { PipelineIcon } from "../../_components/app-icons";
import { api } from "~/lib/trpc/react";
import { DashboardFetchError } from "./dashboard-fetch-error";

function PipelineRowPlaceholder() {
  return (
    <div className="grid grid-cols-[minmax(110px,220px)_1fr_32px] items-center gap-4">
      <div className="h-4 w-28 max-w-full rounded-full bg-border-default" />
      <div className="h-3 overflow-hidden rounded-full bg-surface-sunken">
        <div className="h-full w-2/3 rounded-full bg-border-default" />
      </div>
      <div className="ml-auto h-4 w-7 rounded-full bg-border-default" />
    </div>
  );
}

export function SelectionPipeline() {
  const {
    data: stages,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = api.jobOpening.getSelectionPipeline.useQuery();
  const maxCount = Math.max(...(stages ?? []).map((stage) => stage.count), 1);

  return (
    <section
      aria-label="Pipeline de selección"
      aria-busy={isLoading}
      className="rounded-lg border border-border-default --surfa-card p-5 shadow-sm"
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

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <PipelineRowPlaceholder />
          <PipelineRowPlaceholder />
          <PipelineRowPlaceholder />
          <PipelineRowPlaceholder />
          <PipelineRowPlaceholder />
          <PipelineRowPlaceholder />
        </div>
      ) : isError ? (
        <DashboardFetchError
          refetch={refetch}
          isFetching={isFetching}
        />
      ) : stages && stages.length > 0 ? (
        <div className="flex flex-col gap-4">
          {stages.map((stage) => (
            <div
              key={stage.name}
              className="grid grid-cols-[minmax(110px,220px)_1fr_32px] items-center gap-4"
            >
              <span className="truncate text-base text-text-secondary">
                {stage.name}
              </span>
              <div
                aria-label={`${stage.count} postulaciones`}
                className="h-3 overflow-hidden rounded-full bg-surface-sunken"
              >
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{
                    width: `${(stage.count / maxCount) * 100}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
              <span className="text-right text-base font-semibold text-text-primary">
                {stage.count}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-5 text-sm text-text-secondary">
          No hay postulaciones activas en vacantes abiertas.
        </p>
      )}
    </section>
  );
}
