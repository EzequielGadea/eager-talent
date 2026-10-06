"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useTransition,
} from "react";

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
  const [, startTransition] = useTransition();

  const [moves, setMoves] = useState<Record<string, PendingMove>>({});

  // Cola de requests por postulante: el movimiento N+1 espera a que termine el N.
  const queuesRef = useRef(new Map<string, Promise<unknown>>());
  // Movimientos en vuelo (encolados o ejecutándose), para refrescar una sola vez.
  const pendingRef = useRef(0);

  const clearMove = useCallback((applicantId: string) => {
    setMoves((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([id]) => id !== applicantId),
      ),
    );
  }, []);

  const moveApplicationToStageMutation =
    api.application.moveApplicationToStage.useMutation({
      onError: (error, variables) => {
        clearMove(variables.applicantId);
        console.error("Error al mover el postulante:", error);
      },
      onSettled: () => {
        pendingRef.current -= 1;

        // Un solo refresh cuando ya no queda ningún movimiento pendiente.
        // Evita que respuestas viejas pisen el estado a mitad de una ráfaga.
        if (pendingRef.current === 0) {
          startTransition(() => {
            router.refresh();
          });
        }
      },
    });

  function enqueueMove(variables: {
    applicantId: string;
    jobOpeningId: string;
    targetStage: string;
  }) {
    pendingRef.current += 1;

    const previous =
      queuesRef.current.get(variables.applicantId) ?? Promise.resolve();

    const next = previous
      .catch(() => undefined)
      .then(() =>
        moveApplicationToStageMutation
          .mutateAsync(variables)
          // El error ya se maneja en onError; evitamos un rechazo sin capturar.
          .catch(() => undefined),
      );

    queuesRef.current.set(variables.applicantId, next);

    void next.finally(() => {
      // Limpiamos la cola si nadie encadenó otro movimiento después.
      if (queuesRef.current.get(variables.applicantId) === next) {
        queuesRef.current.delete(variables.applicantId);
      }
    });
  }

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
        // Si ya había un movimiento pendiente, conservamos la columna de
        // origen real (la del servidor). Si la pisamos, la columna original
        // deja de ocultar la card y aparece duplicada.
        fromStage: current[data.candidate.applicantId]?.fromStage ?? data.stage,
        toStage: targetStage,
      },
    }));

    enqueueMove({
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
