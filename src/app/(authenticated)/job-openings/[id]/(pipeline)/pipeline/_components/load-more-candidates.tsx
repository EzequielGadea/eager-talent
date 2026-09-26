"use client";

import { Button } from "~/components/ui/button";

type LoadMoreCandidatesProps = {
  remaining: number;
  loading: boolean;
  onLoadMore: () => void;
};

export function LoadMoreCandidates({
  remaining,
  loading,
  onLoadMore,
}: LoadMoreCandidatesProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full text-xs font-medium text-text-secondary"
      onClick={onLoadMore}
      disabled={loading}
    >
      {loading ? "Cargando..." : `+ ${remaining} candidatos más`}
    </Button>
  );
}
