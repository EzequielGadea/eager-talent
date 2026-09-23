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
  nextOffset: number;
  hasMore: boolean;
};

export function PipelineColumnClient({
  jobOpeningId,
  stageName,
  initialCandidates,
  total,
  nextOffset,
  hasMore: initialHasMore,
}: PipelineColumnClientProps) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [offset, setOffset] = useState(nextOffset);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const fetchMore = api.jobOpening.fetchPipelineCandidates.useQuery(
    {
      jobOpeningId,
      stageName,
      limit: 3,
      offset,
    },
    {
      enabled: false,
    },
  );

  const handleLoadMore = async () => {
    const result = await fetchMore.refetch();

    if (!result.data) return;

    setCandidates((current) => [...current, ...result.data.candidates]);
    setOffset(result.data.nextOffset);
    setHasMore(result.data.hasMore);
  };

  return (
    <div className="flex min-h-24 flex-col gap-2">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.applicantId}
          candidate={candidate}
        />
      ))}

      {hasMore && (
        <LoadMoreCandidates
          remaining={total - candidates.length}
          loading={fetchMore.isFetching}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}