"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const INTERACTIVE_SELECTOR = "input, button, a, select, [role='combobox']";

// Rows are draggable from anywhere, except from the controls inside them
// (inputs, dropdowns, buttons), which must keep working normally.
function canStartDrag(target: EventTarget | null) {
  return (
    target instanceof Element &&
    (target.closest("[data-drag-handle]") !== null ||
      target.closest(INTERACTIVE_SELECTOR) === null)
  );
}

const [mouseActivator] = MouseSensor.activators;
const [touchActivator] = TouchSensor.activators;

class RowMouseSensor extends MouseSensor {
  static activators = [
    {
      ...mouseActivator,
      handler: (...args: Parameters<typeof mouseActivator.handler>) =>
        canStartDrag(args[0].nativeEvent.target) &&
        mouseActivator.handler(...args),
    },
  ];
}

class RowTouchSensor extends TouchSensor {
  static activators = [
    {
      ...touchActivator,
      handler: (...args: Parameters<typeof touchActivator.handler>) =>
        canStartDrag(args[0].nativeEvent.target) &&
        touchActivator.handler(...args),
    },
  ];
}

type DragHandleState = {
  setNode?: (node: HTMLButtonElement | null) => void;
  draggable: boolean;
  isOverlay: boolean;
  move: (offset: -1 | 1) => void;
};

export type SortableRowState = {
  // Spread on the row element (<li>); merge `className` with the row's own.
  rowProps: ComponentProps<"li">;
  handle: DragHandleState;
};

type SortableListProps<T extends { id: string }> = {
  items: T[];
  onMove: (fromIndex: number, toIndex: number) => void;
  // Name used in screen reader announcements, e.g. "la etapa Oferta".
  getLabel: (item: T, index: number) => string;
  renderRow: (item: T, index: number, row: SortableRowState) => ReactNode;
  // The first and last rows stay in place and can't be dragged over.
  fixedEnds?: boolean;
  disabled?: boolean;
  className?: string;
};

// Vertical sortable list: the whole row is the drag source and a copy of it
// follows the pointer while the other rows make room.
export function SortableList<T extends { id: string }>({
  items,
  onMove,
  getLabel,
  renderRow,
  fixedEnds = false,
  disabled = false,
  className,
}: SortableListProps<T>) {
  const dndId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(RowMouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(RowTouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  const canDrag = (index: number) =>
    !disabled && !(fixedEnds && (index === 0 || index === items.length - 1));

  function move(fromIndex: number, toIndex: number) {
    if (fromIndex !== toIndex && canDrag(fromIndex) && canDrag(toIndex)) {
      onMove(fromIndex, toIndex);
    }
  }

  // Keeps the dragged row inside the list (between the fixed ends, if any).
  // The reference elements never move while sorting, so measuring them live
  // stays correct even if the page scrolls during the drag.
  const restrictToList: Modifier = ({ transform, draggingNodeRect }) => {
    const list = listRef.current;

    if (!list || !draggingNodeRect) return transform;

    const rows = list.children;
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    const listRect = list.getBoundingClientRect();
    const minTop = fixedEnds
      ? rows[0].getBoundingClientRect().bottom + gap
      : listRect.top;
    const maxBottom = fixedEnds
      ? rows[rows.length - 1].getBoundingClientRect().top - gap
      : listRect.bottom;

    return {
      ...transform,
      y: Math.min(
        Math.max(transform.y, minTop - draggingNodeRect.top),
        maxBottom - draggingNodeRect.bottom,
      ),
    };
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);

    if (over) {
      move(
        items.findIndex((item) => item.id === active.id),
        items.findIndex((item) => item.id === over.id),
      );
    }
  }

  function describe(id: UniqueIdentifier) {
    const index = items.findIndex((item) => item.id === id);
    const item = items[index];

    return { label: item ? getLabel(item, index) : "", position: index + 1 };
  }

  const activeIndex = items.findIndex((item) => item.id === activeId);
  const activeItem = items[activeIndex];

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToList]}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Tomaste ${describe(active.id).label}.`,
          onDragOver: ({ active, over }) =>
            over
              ? `${describe(active.id).label} está sobre la posición ${describe(over.id).position}.`
              : undefined,
          onDragEnd: ({ active, over }) =>
            over
              ? `Soltaste ${describe(active.id).label} en la posición ${describe(over.id).position}.`
              : `Soltaste ${describe(active.id).label}.`,
          onDragCancel: ({ active }) =>
            `Cancelaste el movimiento de ${describe(active.id).label}.`,
        },
      }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ol
          ref={listRef}
          aria-live="polite"
          className={cn("flex flex-col gap-2", className)}
        >
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              id={item.id}
              draggable={canDrag(index)}
              move={(offset) => move(index, index + offset)}
              render={(row) => renderRow(item, index, row)}
            />
          ))}
        </ol>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <ol inert aria-hidden="true">
            {renderRow(activeItem, activeIndex, {
              rowProps: {
                className:
                  "pointer-events-none cursor-grabbing bg-card shadow-lg ring-1 ring-border-strong",
              },
              handle: { draggable: true, isOverlay: true, move: () => {} },
            })}
          </ol>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableRow({
  id,
  draggable,
  move,
  render,
}: {
  id: string;
  draggable: boolean;
  move: DragHandleState["move"];
  render: (row: SortableRowState) => ReactNode;
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: draggable ? false : { draggable: true, droppable: true },
  });

  return render({
    rowProps: {
      ref: setNodeRef,
      style: { transform: CSS.Translate.toString(transform), transition },
      className: cn(
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
      ),
      ...listeners,
    },
    handle: { setNode: setActivatorNodeRef, draggable, isOverlay: false, move },
  });
}

// Grip button of a row. It is the only element that can be tabbed to, and
// moves the row with the arrow keys; pointer users can drag the whole row.
export function DragHandle({
  setNode,
  draggable,
  isOverlay,
  move,
  label,
}: DragHandleState & { label: string }) {
  return (
    <Button
      ref={setNode}
      type="button"
      variant="ghost"
      size="icon-xs"
      data-drag-handle
      tabIndex={isOverlay ? -1 : undefined}
      className="cursor-grab hover:cursor-grab active:cursor-grabbing max-md:size-9"
      disabled={!draggable}
      aria-label={
        draggable
          ? `Reordenar ${label}. Usa las flechas arriba y abajo.`
          : `${label} no se puede reordenar`
      }
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          move(event.key === "ArrowUp" ? -1 : 1);
        }
      }}
    >
      <GripVertical aria-hidden="true" className="size-5 md:size-3" />
    </Button>
  );
}
