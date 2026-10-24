import Link from "next/link";

import { Skeleton } from "~/components/ui/skeleton";
import { statusConfig } from "../constants";
import { HiringManagersCell, type JobOpening } from "./job-opening-row";

// Mobile alternative to the job openings table: shown below `md`, while the
// table is shown from `md` up.

export function JobOpeningCardListSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-dashboard-border md:hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-full max-w-40" />
              <Skeleton className="h-3 w-24" />
            </div>

            <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
          </div>

          <Skeleton className="h-3 w-full max-w-56" />
        </div>
      ))}
    </div>
  );
}

export function JobOpeningCardList({
  jobOpenings,
  isHiringManagerView,
  emptyMessage,
}: {
  jobOpenings: JobOpening[];
  isHiringManagerView: boolean;
  emptyMessage: string;
}) {
  if (jobOpenings.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-dashboard-text-muted md:hidden">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-dashboard-border md:hidden">
      {jobOpenings.map((jobOpening) => (
        <li key={jobOpening.id}>
          <JobOpeningCard
            jobOpening={jobOpening}
            isHiringManagerView={isHiringManagerView}
          />
        </li>
      ))}
    </ul>
  );
}

// The name link stretches over the whole card (after:inset-0), so tapping
// anywhere opens the job opening; the hiring managers popover sits above it.
function JobOpeningCard({
  jobOpening,
  isHiringManagerView,
}: {
  jobOpening: JobOpening;
  isHiringManagerView: boolean;
}) {
  const status = statusConfig[jobOpening.status];

  const formattedDate = new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(jobOpening.openingDate));

  return (
    <article className="relative flex flex-col gap-2.5 px-4 py-3 transition-colors hover:bg-accent-green/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/job-openings/${jobOpening.id}`}
            className="block truncate text-sm font-semibold text-text-primary after:absolute after:inset-0"
          >
            {jobOpening.name}
          </Link>

          <p className="truncate text-xs text-text-secondary">
            {jobOpening.area.name}
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
        >
          <span className="size-1.5 rounded-full bg-current" />

          {status.label}
        </span>
      </div>

      {!isHiringManagerView && (
        <div className="relative z-10 w-fit max-w-full text-xs">
          <HiringManagersCell managers={jobOpening.hiringManagers} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <span>
          <span className="font-semibold text-text-primary">
            {jobOpening.applicants}
          </span>{" "}
          en pipeline
        </span>

        {isHiringManagerView && (
          <>
            <span>
              <span className="font-semibold text-text-primary">
                {jobOpening.technicalInterviewApplicants}
              </span>{" "}
              en entrevista técnica
            </span>

            <span>
              <span className="font-semibold text-text-primary">
                {jobOpening.offeredApplicants}
              </span>{" "}
              ofertados
            </span>
          </>
        )}

        <span className="ml-auto">{formattedDate}</span>
      </div>
    </article>
  );
}
