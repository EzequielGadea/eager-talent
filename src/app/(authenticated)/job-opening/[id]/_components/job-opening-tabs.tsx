"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { JobOpeningFilters } from "./job-opening-filters";

type JobOpeningTabsProps = {
  jobOpeningId: string;
};

export function JobOpeningTabs({
  jobOpeningId,
}: JobOpeningTabsProps) {
  const segment = useSelectedLayoutSegment();

  const activeTab =
    segment === "disqualified" ? "disqualified" : "pipeline";

  return (
    <div className="border-b border-border-default">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link
            href={`/job-opening/${jobOpeningId}/pipeline`}
            aria-current={activeTab === "pipeline" ? "page" : undefined}
            className={
              activeTab === "pipeline"
                ? "relative pb-3 text-sm font-semibold text-text-primary"
                : "relative pb-3 text-sm font-semibold text-text-secondary hover:text-text-primary"
            }
          >
            Pipeline

            {activeTab === "pipeline" && (
              <span className="absolute inset-x-0 bottom-[-3px] h-0.5 bg-text-primary" />
            )}
          </Link>

          <Link
            href={`/job-opening/${jobOpeningId}/disqualified`}
            aria-current={
              activeTab === "disqualified" ? "page" : undefined
            }
            className={
              activeTab === "disqualified"
                ? "relative pb-3 text-sm font-semibold text-text-primary"
                : "relative pb-3 text-sm font-semibold text-text-secondary hover:text-text-primary"
            }
          >
            Descalificados

            {activeTab === "disqualified" && (
              <span className="absolute inset-x-0 bottom-[-3px] h-0.5 bg-text-primary" />
            )}
          </Link>
        </div>

        <div className="-translate-y-2">
          <JobOpeningFilters />
        </div>
      </div>
    </div>
  );
}