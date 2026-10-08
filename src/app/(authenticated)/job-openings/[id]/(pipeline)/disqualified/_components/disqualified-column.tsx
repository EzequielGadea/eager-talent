"use client";

import { DisqualifiedApplication } from "./types";
import { useState } from "react";
import { LoadMoreCandidates } from "../../pipeline/_components/load-more-candidates";
import { DisqualifiedCard } from "./disqualified-card";

const stageColors = [
  "border-dashboard-sky-text",
  "border-dashboard-purple-text",
  "border-dashboard-orange-text",
  "border-dashboard-success-text",
  "border-tag-gray-fg",
  "border-tag-blue-fg",
  "border-tag-amber-fg",
];

const PAGE_SIZE = 3;

function getStageColor(stageName: string) {
  const hash = stageName
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return stageColors[hash % stageColors.length];
}

type DisqualifiedColumnProps = {
  stageName: string;
  applications: DisqualifiedApplication[];
};

export function DisqualifiedColumn({
  stageName,
  applications,
}: DisqualifiedColumnProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleApplications = applications.slice(0, visibleCount);
  const remaining = applications.length - visibleApplications.length;

  return (
    <section
      className={`flex w-80 shrink-0 flex-col gap-3 border-t-4 pt-3 ${getStageColor(stageName)}`}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{stageName}</h2>

        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {applications.length}
        </span>
      </header>

      <div className="flex min-h-24 flex-col gap-2">
        {applications.length === 0 ? (
          <p className="text-xs text-text-secondary">
            Sin postulaciones descalificadas en esta etapa.
          </p>
        ) : (
          visibleApplications.map((application) => (
            <DisqualifiedCard
              key={application.applicantId}
              application={application}
            />
          ))
        )}

        {/* "+ N candidatos más": muestra las siguientes. */}
        {remaining > 0 && (
          <LoadMoreCandidates
            remaining={remaining}
            loading={false}
            onLoadMore={() => setVisibleCount((count) => count + PAGE_SIZE)}
          />
        )}
      </div>
    </section>
  );
}
