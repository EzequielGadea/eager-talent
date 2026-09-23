"use client";

import { useState } from "react";

import { api } from "~/lib/trpc/react";

import { CandidateCard } from "./candidate-card";
import { LoadMoreCandidates } from "./load-more-candidates";
import type { PipelineCandidate } from "./types";

type PipelineColumnClientProps = {
  jobOpeningId: string;
  stageName: string;
  initialCandidates: PipelineCandidate[];
  total: number;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
};

export function PipelineColumnClient({
  jobOpeningId,
  stageName,
  initialCandidates,
  total,
  canUpdateApplication,
  canCreateInterview,
}: PipelineColumnClientProps) {
  const [loadedCandidates, setLoadedCandidates] =
    useState<PipelineCandidate[]>(initialCandidates);

  const [optimisticallyRemovedIds, setOptimisticallyRemovedIds] = useState<
    Set<string>
  >(new Set());

  const allCandidates = [
    ...initialCandidates,
    ...loadedCandidates.filter(
      (loadedCandidate) =>
        !initialCandidates.some(
          (initialCandidate) =>
            initialCandidate.applicantId === loadedCandidate.applicantId,
        ),
    ),
  ];

  const initialCandidateIds = new Set(
    initialCandidates.map((candidate) => candidate.applicantId),
  );

  const visibleOptimisticRemovedIds = new Set(
    [...optimisticallyRemovedIds].filter((id) => initialCandidateIds.has(id)),
  );

  const candidates = allCandidates.filter(
    (candidate) => !visibleOptimisticRemovedIds.has(candidate.applicantId),
  );

  const loadedCount = allCandidates.length;

  const effectiveTotal = total - visibleOptimisticRemovedIds.size;

  const remaining = Math.max(0, effectiveTotal - candidates.length);

  const hasMore = remaining > 0;

  const fetchMore = api.jobOpening.fetchPipelineCandidates.useQuery(
    {
      jobOpeningId,
      stageName,
      limit: 3,
      offset: loadedCount,
    },
    {
      enabled: false,
    },
  );

  async function handleLoadMore() {
    const result = await fetchMore.refetch();

    if (!result.data) {
      return;
    }

    setLoadedCandidates((current) => {
      const currentIds = new Set(
        current.map((candidate) => candidate.applicantId),
      );

      const newCandidates = result.data.candidates.filter(
        (candidate) => !currentIds.has(candidate.applicantId),
      );

      return [...current, ...newCandidates];
    });
  }

  function handleCandidateAdvanced(applicantId: string) {
    setLoadedCandidates((current) =>
      current.filter((candidate) => candidate.applicantId !== applicantId),
    );

    setOptimisticallyRemovedIds((current) => {
      const next = new Set(current);
      next.add(applicantId);
      return next;
    });
  }

  return (
    <div className="flex min-h-24 flex-col gap-2">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.applicantId}
          candidate={candidate}
          jobOpeningId={jobOpeningId}
          currentStage={stageName}
          onAdvanced={handleCandidateAdvanced}
          canUpdateApplication={canUpdateApplication}
          canCreateInterview={canCreateInterview}
        />
      ))}

      {hasMore && (
        <LoadMoreCandidates
          remaining={remaining}
          loading={fetchMore.isFetching}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}
