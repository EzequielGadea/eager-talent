"use client";

import { useEffect, useState } from "react";

import { useDroppable } from "@dnd-kit/core";

import { api } from "~/lib/trpc/react";

import { CandidateCard } from "./candidate-card";
import { LoadMoreCandidates } from "./load-more-candidates";
import { usePipelineMoves } from "./pipeline-dnd-provider";
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
  const { setNodeRef, isOver } = useDroppable({
    id: stageName,
  });

  const { moves, clearMove } = usePipelineMoves();

  const [loadedCandidates, setLoadedCandidates] = useState<PipelineCandidate[]>(
    [],
  );

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

  const movedOutIds = new Set(
    Object.entries(moves)
      .filter(([, move]) => move.fromStage === stageName)
      .map(([applicantId]) => applicantId),
  );

  const [previousMoves, setPreviousMoves] = useState(moves);

  if (moves !== previousMoves) {
    setPreviousMoves(moves);

    if (movedOutIds.size > 0) {
      setLoadedCandidates((current) =>
        current.filter((candidate) => !movedOutIds.has(candidate.applicantId)),
      );
    }
  }

  const allCandidateIds = new Set(
    allCandidates.map((candidate) => candidate.applicantId),
  );

  const movedIn = Object.values(moves)
    .filter((move) => move.toStage === stageName)
    .map((move) => move.candidate)
    .filter((candidate) => !allCandidateIds.has(candidate.applicantId));

  const candidates = [
    ...movedIn,
    ...allCandidates.filter(
      (candidate) =>
        !visibleOptimisticRemovedIds.has(candidate.applicantId) &&
        !movedOutIds.has(candidate.applicantId),
    ),
  ];

  const loadedCount = allCandidates.length;

  const effectiveTotal =
    total -
    visibleOptimisticRemovedIds.size -
    movedOutIds.size +
    movedIn.length;

  const remaining = Math.max(0, effectiveTotal - candidates.length);

  const hasMore = remaining > 0;

  useEffect(() => {
    for (const move of Object.values(moves)) {
      if (
        move.toStage === stageName &&
        initialCandidates.some(
          (candidate) => candidate.applicantId === move.candidate.applicantId,
        )
      ) {
        clearMove(move.candidate.applicantId);
      }
    }
  }, [initialCandidates, moves, stageName, clearMove]);

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
    <div
      ref={setNodeRef}
      className={`flex min-h-24 min-w-72 flex-1 flex-col gap-2 rounded-lg transition-colors ${
        isOver ? "bg-accent" : ""
      }`}
    >
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
