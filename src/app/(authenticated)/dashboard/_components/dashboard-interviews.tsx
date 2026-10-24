"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { InterviewsIcon } from "../../_components/app-icons";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";

export function DashboardInterviews() {
  const { data: interviews, isLoading, isError, error } =
    api.interview.getInterviewAmount.useQuery();

  useEffect(() => {
    if (isError) toast.add({ title: error.message, type: "error" });
  }, [error, isError]);

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
          <>
            <div
              className="mt-2 h-9 w-16 animate-pulse rounded-md bg-border-default"
              aria-label="Entrevistas esta semana: dato pendiente de cargar"
            />
            <div className="mt-2 h-3 w-32 rounded-full bg-surface-sunken" />
          </>
        ) : isError ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            No se pudieron cargar las entrevistas.
          </p>
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
