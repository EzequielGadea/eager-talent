import type { ClientRect, Modifier } from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

function insetBounds(
  bounds: ClientRect,
  card: ClientRect,
  vertical: boolean,
): ClientRect {
  const available = vertical
    ? bounds.height - card.height
    : bounds.width - card.width;
  const margin = Math.min(8, Math.max(0, available / 2));

  return {
    top: bounds.top + (vertical ? margin : 0),
    bottom: bounds.bottom - (vertical ? margin : 0),
    height: bounds.height - (vertical ? margin * 2 : 0),
    left: bounds.left + (vertical ? 0 : margin),
    right: bounds.right - (vertical ? 0 : margin),
    width: bounds.width - (vertical ? 0 : margin * 2),
  };
}

export const restrictToPipeline: Modifier = (args) => {
  const { draggingNodeRect, scrollableAncestors, scrollableAncestorRects } =
    args;
  const board = scrollableAncestors[0]?.querySelector<HTMLElement>(
    "[data-pipeline-board]",
  );

  if (!board || !draggingNodeRect || !args.windowRect) {
    return args.transform;
  }

  const vertical = getComputedStyle(board).flexDirection === "column";
  const boundedArgs = {
    ...args,
    windowRect: insetBounds(args.windowRect, draggingNodeRect, vertical),
    scrollableAncestorRects: scrollableAncestorRects.map((rect, index) =>
      index === 0 ? insetBounds(rect, draggingNodeRect, vertical) : rect,
    ),
  };

  // Keep the card in the shared viewport so it can still reach other stages.
  const transform = restrictToWindowEdges({
    ...boundedArgs,
    transform: restrictToFirstScrollableAncestor(boundedArgs),
  });

  return (vertical ? restrictToVerticalAxis : restrictToHorizontalAxis)({
    ...boundedArgs,
    transform,
  });
};
