"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";

import { api } from "~/lib/trpc/react";

type PipelineDndProviderProps = {
  jobOpeningId: string;
  children: React.ReactNode;
};

export function PipelineDndProvider({
  jobOpeningId,
  children,
}: PipelineDndProviderProps) {
  const router = useRouter();

  const moveApplicationToStageMutation =
    api.application.moveApplicationToStage.useMutation({
      onSuccess: () => {
        router.refresh();
      },
    });

  function handleDragEnd(event: DragEndEvent) {
    const applicantId = String(event.active.id);
    const newStageName = event.over ? String(event.over.id) : null;

    if (!newStageName) {
      return;
    }

    if (event.active.id === event.over?.id) {
      return;
    }

    moveApplicationToStageMutation.mutate({
      applicantId,
      jobOpeningId,
      targetStage: newStageName,
    });
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
