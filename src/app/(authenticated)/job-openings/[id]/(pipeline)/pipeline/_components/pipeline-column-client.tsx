"use client";

import { useEffect, useState } from "react";

import { useDroppable } from "@dnd-kit/core";

import { api } from "~/lib/trpc/react";

import { ApplicantCard } from "./applicant-card";
import { LoadMoreApplicants } from "./load-more-applicants";
import { usePipelineMoves } from "./pipeline-dnd-provider";
import type { PipelineCandidate } from "./types";

type PipelineColumnClientProps = {
  jobOpeningId: string;
  stageId: string;
  stageName: string;
  initialCandidates: PipelineCandidate[];
  total: number;
  isLastStage: boolean;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
  canDeleteInterview: boolean;
  search?: string;
};

export function PipelineColumnClient({
  jobOpeningId,
  stageId,
  stageName,
  initialCandidates,
  total,
  isLastStage,
  canUpdateApplication,
  canCreateInterview,
  canDeleteInterview,
  search,
}: PipelineColumnClientProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
    disabled: !canUpdateApplication,
  });

  const { moves, clearMove } = usePipelineMoves();

  const [loadedCandidates, setLoadedCandidates] = useState<PipelineCandidate[]>(
    [],
  );

  const [optimisticallyRemovedIds, setOptimisticallyRemovedIds] = useState<
    Set<string>
  >(new Set());

  const [previousInitialCandidates, setPreviousInitialCandidates] =
    useState(initialCandidates);

  if (initialCandidates !== previousInitialCandidates) {
    setPreviousInitialCandidates(initialCandidates);
    setLoadedCandidates([]); // Reset loaded candidates when search changes

    setOptimisticallyRemovedIds((current) => {
      const stillInitial = new Set(
        initialCandidates.map((candidate) => candidate.applicantId),
      );
      const next = new Set([...current].filter((id) => stillInitial.has(id)));

      return next.size === current.size ? current : next;
    });
  }

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

  const allCandidateIds = new Set(
    allCandidates.map((candidate) => candidate.applicantId),
  );

  // Una card con movimiento pendiente solo debe verse en su columna destino.
  // Se oculta en cualquier otra columna donde el servidor todavía la tenga
  // (la de origen o una intermedia si se movió más de una vez seguida).
  const movedOutIds = new Set(
    Object.entries(moves)
      .filter(
        ([applicantId, move]) =>
          move.toStageId !== stageId &&
          (move.fromStageId === stageId || allCandidateIds.has(applicantId)),
      )
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

  const movedIn = Object.values(moves)
    .filter((move) => move.toStageId === stageId)
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
        move.toStageId === stageId &&
        initialCandidates.some(
          (candidate) => candidate.applicantId === move.candidate.applicantId,
        )
      ) {
        clearMove(move.candidate.applicantId);
      }
    }
  }, [initialCandidates, moves, stageId, clearMove]);

  const fetchMore = api.jobOpening.fetchPipelineCandidates.useQuery(
    {
      jobOpeningId,
      stageId,
      limit: 3,
      offset: loadedCount,
      search,
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
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text-primary">
            {stageName}
          </h2>

          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {Math.max(0, effectiveTotal)}
          </span>
        </div>
      </header>

      <div
        ref={setNodeRef}
        className={`flex min-h-24 min-w-72 flex-1 flex-col gap-2 rounded-lg transition-colors ${
          isOver ? "bg-accent" : ""
        }`}
      >
        {candidates.map((candidate) => (
          <ApplicantCard
            key={candidate.applicantId}
            candidate={candidate}
            jobOpeningId={jobOpeningId}
            currentStageId={stageId}
            currentStageName={stageName}
            isLastStage={isLastStage}
            onAdvancedAction={handleCandidateAdvanced}
            canUpdateApplication={canUpdateApplication}
            canCreateInterview={canCreateInterview}
            canDeleteInterview={canDeleteInterview}
          />
        ))}

        {hasMore && (
          <LoadMoreApplicants
            remaining={remaining}
            loading={fetchMore.isFetching}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>
    </>
  );
}
