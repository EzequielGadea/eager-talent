"use client";

import { useEffect, useState } from "react";

import { LoadMoreCandidates } from "~/app/(authenticated)/job-openings/[id]/(pipeline)/pipeline/_components/load-more-candidates";

import { DisqualifiedCard } from "./disqualified-card";
import { DISQUALIFIED_PAGE_SIZE, type DisqualifiedApplication } from "../types";

type DisqualifiedColumnProps = {
  jobOpeningId: string;
  stageName: string;
  stageColor: string;
  applications: DisqualifiedApplication[];
  canRequalify: boolean;
  now: number;
};

export function DisqualifiedColumn({
  jobOpeningId,
  stageName,
  stageColor,
  applications,
  canRequalify,
  now,
}: DisqualifiedColumnProps) {
  const [visibleCount, setVisibleCount] = useState(DISQUALIFIED_PAGE_SIZE);

  useEffect(() => {
    return () => setVisibleCount(DISQUALIFIED_PAGE_SIZE);
  }, []);

  const visibleApplications = applications.slice(0, visibleCount);
  const remaining = applications.length - visibleApplications.length;

  return (
    <section
      className="flex w-80 shrink-0 flex-col gap-3 border-t-4 pt-3"
      style={{ borderTopColor: stageColor }}
    >
      {/* Nombre de la etapa a la izquierda y cantidad a la derecha. */}
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{stageName}</h2>

        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {applications.length}
        </span>
      </header>

      <div className="flex min-h-24 flex-col gap-2">
        {visibleApplications.map((application) => (
          <DisqualifiedCard
            key={application.applicantId}
            application={application}
            jobOpeningId={jobOpeningId}
            canRequalify={canRequalify}
            now={now}
            stageName={stageName}
          />
        ))}

        {/* "+ N candidatos más": muestra las siguientes. */}
        {remaining > 0 && (
          <LoadMoreCandidates
            remaining={remaining}
            loading={false}
            onLoadMore={() =>
              setVisibleCount((count) => count + DISQUALIFIED_PAGE_SIZE)
            }
          />
        )}
      </div>
    </section>
  );
}
