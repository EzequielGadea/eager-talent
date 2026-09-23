"use client";

import { useEffect, useRef, useState } from "react";

import { api } from "~/lib/trpc/react";

import { CandidateCard } from "./candidate-card";
import { LoadMoreCandidates } from "./load-more-candidates";
import type { PipelineCandidate } from "./types";

type PipelineColumnClientProps = {
  jobOpeningId: string;
  stageName: string;
  initialCandidates: PipelineCandidate[];
  total: number;
};

export function PipelineColumnClient({
  jobOpeningId,
  stageName,
  initialCandidates,
  total,
}: PipelineColumnClientProps) {
  const [candidates, setCandidates] =
    useState<PipelineCandidate[]>(initialCandidates);

  const [optimisticRemovedCount, setOptimisticRemovedCount] =
    useState(0);

  const previousTotalRef = useRef(total);

  const fetchMore =
    api.jobOpening.fetchPipelineCandidates.useQuery(
      {
        jobOpeningId,
        stageName,
        limit: 3,
        offset: candidates.length,
      },
      {
        enabled: false,
      },
    );

  useEffect(() => {
    setCandidates((current) => {
      const currentIds = new Set(
        current.map((candidate) => candidate.applicantId),
      );

      const newCandidates = initialCandidates.filter(
        (candidate) => !currentIds.has(candidate.applicantId),
      );

      if (newCandidates.length === 0) {
        return current;
      }

      return [...newCandidates, ...current];
    });

    if (total !== previousTotalRef.current) {
      setOptimisticRemovedCount(0);
      previousTotalRef.current = total;
    }
  }, [initialCandidates, total]);

  const handleLoadMore = async () => {
    const result = await fetchMore.refetch();

    if (!result.data) {
      return;
    }

    setCandidates((current) => [
      ...current,
      ...result.data.candidates,
    ]);
  };

  const handleCandidateAdvanced = (applicantId: string) => {
    setCandidates((current) =>
      current.filter(
        (candidate) => candidate.applicantId !== applicantId,
      ),
    );

    setOptimisticRemovedCount((current) => current + 1);
  };

  const effectiveTotal = Math.max(
    0,
    total - optimisticRemovedCount,
  );

  const remaining = Math.max(
    0,
    effectiveTotal - candidates.length,
  );

  const hasMore = remaining > 0;

  return (
    <div className="flex min-h-24 flex-col gap-2">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.applicantId}
          candidate={candidate}
          jobOpeningId={jobOpeningId}
          currentStage={stageName}
          onAdvanced={handleCandidateAdvanced}
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