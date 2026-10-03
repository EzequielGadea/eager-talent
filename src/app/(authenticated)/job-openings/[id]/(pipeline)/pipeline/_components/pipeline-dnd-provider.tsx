"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";

import { api } from "~/lib/trpc/react";

import type { PendingMove, PipelineCandidate } from "./types";

type PipelineMovesContextValue = {
  moves: Record<string, PendingMove>;
  clearMove: (applicantId: string) => void;
};

const PipelineMovesContext = createContext<PipelineMovesContextValue>({
  moves: {},
  clearMove: () => {},
});

export function usePipelineMoves() {
  return useContext(PipelineMovesContext);
}

type PipelineDndProviderProps = {
  jobOpeningId: string;
  children: React.ReactNode;
};

export function PipelineDndProvider({
  jobOpeningId,
  children,
}: PipelineDndProviderProps) {
  const router = useRouter();

  const [moves, setMoves] = useState<Record<string, PendingMove>>({});

  const clearMove = useCallback((applicantId: string) => {
    setMoves((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([id]) => id !== applicantId),
      ),
    );
  }, []);

  const moveApplicationToStageMutation =
    api.application.moveApplicationToStage.useMutation({
      onSuccess: () => {
        router.refresh();
      },
      onError: (error, variables) => {
        clearMove(variables.applicantId);
        console.error("Error al mover el postulante:", error);
      },
    });

  function handleDragEnd(event: DragEndEvent) {
    const data = event.active.data.current as
      { candidate: PipelineCandidate; stage: string } | undefined;

    const targetStage = event.over ? String(event.over.id) : null;

    if (!data || !targetStage) {
      return;
    }

    if (targetStage === data.stage) {
      return;
    }

    setMoves((current) => ({
      ...current,
      [data.candidate.applicantId]: {
        candidate: data.candidate,
        fromStage: data.stage,
        toStage: targetStage,
      },
    }));

    moveApplicationToStageMutation.mutate({
      applicantId: data.candidate.applicantId,
      jobOpeningId,
      targetStage,
    });
  }

  return (
    <PipelineMovesContext.Provider value={{ moves, clearMove }}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {children}
      </DndContext>
    </PipelineMovesContext.Provider>
  );
}
