"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";

import { ScrollArea } from "~/components/ui/scroll-area";

export function PipelineHorizontalScroll({
  children,
}: {
  children: ReactNode;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{
    startX: number;
    startScrollLeft: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  function getViewport() {
    return scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const target = event.target as HTMLElement;

    // No desplazar el tablero cuando se interactúa con una card o con controles
    if (
      target.closest(
        'button, input, select, textarea, a, [role="button"], [data-pipeline-candidate]',
      )
    ) {
      return;
    }

    const viewport = getViewport();
    if (!viewport) return;

    dragRef.current = {
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;

    const viewport = getViewport();
    if (!viewport) return;

    const distance = event.clientX - dragRef.current.startX;

    if (Math.abs(distance) > 4) {
      setIsDragging(true);
    }

    viewport.scrollLeft = dragRef.current.startScrollLeft - distance;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      ref={scrollAreaRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`cursor-grab select-none ${
        isDragging ? "cursor-grabbing" : ""
      }`}
    >
      <ScrollArea ref={scrollAreaRef} className="w-full">
        {children}
      </ScrollArea>
    </div>
  );
}
