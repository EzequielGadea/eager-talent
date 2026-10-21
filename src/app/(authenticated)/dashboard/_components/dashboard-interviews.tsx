"use client";

import { InterviewsIcon } from "../../_components/app-icons";
import { api } from "~/lib/trpc/react";

export function DashboardInterviews() {
  const { data: interviews, isLoading } =
    api.interview.getInterviewAmount.useQuery();

  return (
    <article className="flex min-h-32 items-start gap-4 rounded-lg border border-border-default bg-white p-5 shadow-sm">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-tag-purple-bg">
        <InterviewsIcon
          className="size-5.5 text-tag-purple-fg"
          aria-hidden="true"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="text-[13px] font-normal text-text-secondary">
          Entrevistas esta semana
        </h2>

        {isLoading ? (
          <div
            className="mt-2 h-9 w-16 animate-pulse rounded-md bg-border-default"
            aria-label="Entrevistas esta semana: dato pendiente de cargar"
          />
        ) : (
          <p className="mt-1 text-3xl leading-none font-semibold text-text-primary">
            {interviews?.amount ?? "—"}
          </p>
        )}
      </div>
    </article>
  );
}
