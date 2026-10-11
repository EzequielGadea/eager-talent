import { headers } from "next/headers";
import { ArrowRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import type { api } from "~/lib/trpc/server";
import {
  NO_APPLICATION_LABEL,
  formatInterviewDate,
} from "../_lib/interview-date";

type Interview = Awaited<ReturnType<typeof api.interview.getById>>;

type InterviewHeaderProps = {
  interviewPromise: Promise<Interview>;
};

export async function InterviewHeader({
  interviewPromise,
}: InterviewHeaderProps) {
  const interview = await interviewPromise;
  const canUpdateApplication = await auth.api.hasPermission({
    headers: await headers(),
    body: { permissions: { application: ["update"] } },
  });

  const { applicant, application, date } = interview;
  const applicantName = `${applicant.name} ${applicant.lastName}`;
  const initials =
    `${applicant.name.charAt(0)}${applicant.lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="size-12">
          <AvatarImage
            src={applicant.photo ?? undefined}
            alt={applicantName}
            className="object-cover"
          />
          <AvatarFallback className="bg-tag-green-bg text-sm font-semibold text-tag-green-fg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-text-primary">
            {interview.name}
          </h1>
          <p className="mt-0.5 wrap-anywhere text-xs text-text-secondary">
            {applicantName} · Postulación:{" "}
            <span className="font-semibold text-text-primary">
              {application?.jobOpening.name ?? NO_APPLICATION_LABEL}
            </span>
            {date && ` · ${formatInterviewDate(date)}`}
          </p>
        </div>
      </div>

      {/* TODO: wire up stage advancement. */}
      {application && canUpdateApplication.success && (
        <Button
          size="sm"
          className="h-8 shrink-0 gap-2 self-start rounded-full bg-dashboard-dark px-4 text-xs font-semibold text-text-on-dark hover:bg-dashboard-dark-hover sm:self-auto"
          style={{ touchAction: "manipulation" }}
        >
          <ArrowRight className="size-3.5" aria-hidden="true" />
          Avanzar de etapa
        </Button>
      )}
    </header>
  );
}
