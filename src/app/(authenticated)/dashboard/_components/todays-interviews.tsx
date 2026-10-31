"use client";

import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import getAvatar from "~/lib/avatar";
import { getTagColor } from "~/lib/tags/get-tag-color";
import { getTagStyles } from "~/lib/tags/get-tag-styles";
import { api } from "~/lib/trpc/react";
import { DashboardFetchError } from "./dashboard-fetch-error";

function InterviewPlaceholder() {
  return (
    <div className="grid grid-cols-[4.5rem_3rem_minmax(0,1fr)_3.5rem] items-center gap-4 border-b border-border-default py-4 last:border-b-0">
      <div className="h-4 w-12 rounded-full bg-border-default" />
      <div className="size-12 rounded-full bg-border-default" />
      <div className="flex min-w-0 flex-col gap-2">
        <div className="h-4 w-36 max-w-full rounded-full bg-border-default" />
        <div className="h-3.5 w-48 max-w-full rounded-full bg-surface-sunken" />
      </div>
      <div className="h-6 w-14 rounded-full bg-surface-sunken" />
    </div>
  );
}

export function TodaysInterviews() {
  const { data, isLoading, isError, isFetching, refetch } =
    api.interview.today.useQuery();
  const interviews = data?.interviews ?? [];

  return (
    <section
      aria-label="Entrevistas de hoy"
      aria-busy={isLoading}
      className="rounded-lg border border-border-default --surfa-card p-5 shadow-sm"
    >
      <header className="mb-1 flex items-center gap-2">
        <Clock className="size-4.5 text-text-secondary" aria-hidden="true" />
        <h2 className="text-[15px] font-semibold text-text-primary">
          Entrevistas de hoy
        </h2>
      </header>

      {isLoading ? (
        <div>
          <InterviewPlaceholder />
          <InterviewPlaceholder />
          <InterviewPlaceholder />
          <InterviewPlaceholder />
          <InterviewPlaceholder />
        </div>
      ) : isError ? (
        <div className="flex justify-center py-5">
          <DashboardFetchError
            refetch={refetch}
            isFetching={isFetching}
          />
        </div>
      ) : interviews.length > 0 ? (
        interviews.map((interview) => {
          const avatar = getAvatar(
            interview.applicant.name,
            interview.applicant.lastName,
          );
          const interviewType = interview.stageName;
          const interviewer = interview.interviewers[0];
          const applicantTitle =
            interview.applicant.title ?? interview.application?.jobOpening.name;

          return (
            <div
              key={interview.id}
              className="grid grid-cols-[4.5rem_3rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-border-default py-4 last:border-b-0"
            >
              <time
                className="text-base font-medium text-text-secondary"
                dateTime={interview.date?.toString()}
              >
                {interview.date
                  ? format(
                      new TZDate(interview.date, "America/Montevideo"),
                      "HH:mm",
                    )
                  : "--:--"}
              </time>

              <Avatar className="size-12">
                <AvatarImage
                  src={interview.applicant.photo ?? undefined}
                  alt={`${interview.applicant.name} ${interview.applicant.lastName}`}
                />
                <AvatarFallback className={avatar.colorClass}>
                  {avatar.initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-base leading-6 font-semibold text-text-primary">
                  {interview.applicant.name} {interview.applicant.lastName}
                </p>
                <p className="truncate text-sm leading-5 text-text-secondary">
                  {applicantTitle ?? "Candidato"}
                  {interviewer && (
                    <>
                      <span aria-hidden="true"> · </span>
                      con {interviewer.name} {interviewer.lastName}
                    </>
                  )}
                </p>
              </div>

              <Badge
                variant="tag"
                className="h-auto px-3 py-1 text-sm font-semibold"
                style={getTagStyles(getTagColor(interviewType))}
              >
                {interviewType}
              </Badge>
            </div>
          );
        })
      ) : (
        <p className="py-5 text-sm text-text-secondary">
          No hay entrevistas para hoy.
        </p>
      )}
    </section>
  );
}
