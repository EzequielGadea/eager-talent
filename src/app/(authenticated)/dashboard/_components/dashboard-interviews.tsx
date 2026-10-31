"use client";

import { Check, CircleAlert } from "lucide-react";
import { InterviewsIcon } from "../../_components/app-icons";
import { api } from "~/lib/trpc/react";
import { DashboardFetchError } from "./dashboard-fetch-error";

export function DashboardInterviews() {
  const {
    data: interviews,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = api.interview.getInterviewAmount.useQuery();

  return (
    <article className="flex min-h-32 items-start gap-4 rounded-lg border border-border-default --surfa-card p-5 shadow-sm">
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${isError ? "bg-danger-bg" : "bg-tag-purple-bg"}`}
      >
        {isError ? (
          <CircleAlert className="size-5.5 text-danger" aria-hidden="true" />
        ) : (
          <InterviewsIcon
            className="size-5.5 text-tag-purple-fg"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="text-[13px] font-normal text-text-secondary">
          Entrevistas esta semana
        </h2>

        {isLoading ? (
          <>
            <div
              className="mt-2 h-9 w-16 animate-pulse rounded-md bg-border-default"
              aria-label="Entrevistas esta semana: dato pendiente de cargar"
            />
            <div className="mt-2 h-3 w-32 rounded-full bg-surface-sunken" />
          </>
        ) : isError ? (
          <DashboardFetchError
            refetch={refetch}
            isFetching={isFetching}
          />
        ) : (
          <>
            <p className="mt-1 text-3xl leading-none font-semibold text-text-primary">
              {interviews?.amount ?? "—"}
            </p>
            <p className="mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-tertiary">
              <Check
                aria-hidden="true"
                className="size-4 shrink-0 text-tag-green-fg"
              />
              {interviews?.today ?? 0}{" "}
              {(interviews?.today ?? 0) === 1
                ? "completada hoy"
                : "completadas hoy"}
            </p>
          </>
        )}
      </div>
    </article>
  );
}
