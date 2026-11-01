"use client";

import { ArrowUpRight, X } from "lucide-react";
import { VacanciesIcon } from "../../_components/app-icons";
import { api } from "~/lib/trpc/react";
import { DashboardFetchError } from "./dashboard-fetch-error";

export function DashboardActiveJobOpening() {
  const {
    data: jobOpenings,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = api.jobOpening.getJobOpeningsAmount.useQuery({});

  return (
    <article className="flex min-h-32 items-start gap-4 rounded-lg border border-border-default bg-surface-card p-5 shadow-sm">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success-bg">
        <VacanciesIcon
          className="size-5.5 text-accent-green-strong"
          aria-hidden="true"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="text-[13px] font-normal text-text-secondary">
          Vacantes activas
        </h2>

        {isLoading ? (
          <>
            <div
              className="mt-2 h-9 w-16 animate-pulse rounded-md bg-border-default"
              aria-label="Vacantes activas: dato pendiente de cargar"
            />
            <div className="mt-2 h-3 w-32 rounded-full bg-surface-sunken" />
          </>
        ) : isError ? (
          <DashboardFetchError refetch={refetch} isFetching={isFetching} />
        ) : (
          <>
            <p className="mt-1 text-3xl leading-none font-semibold text-text-primary">
              {jobOpenings?.open ?? "—"}
            </p>
            <p
              aria-label={`${jobOpenings?.openedThisWeek ?? 0} vacantes nuevas esta semana`}
              className={`mt-2 inline-flex w-fit items-center gap-1 text-sm font-medium ${
                (jobOpenings?.openedThisWeek ?? 0) > 0
                  ? "text-tag-green-fg"
                  : "text-destructive"
              }`}
            >
              {(jobOpenings?.openedThisWeek ?? 0) > 0 && (
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              )}
              {(jobOpenings?.openedThisWeek ?? 0) === 0 && (
                <X aria-hidden="true" className="size-3.5" />
              )}
              {jobOpenings?.openedThisWeek ?? 0} nuevas esta semana
            </p>
          </>
        )}
      </div>
    </article>
  );
}
