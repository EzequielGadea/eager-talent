import type { CSSProperties } from "react";

import { TAG_COLORS, type TagColor } from "./get-tag-color";

function isTagColor(color: string): color is TagColor {
  return TAG_COLORS.some((tagColor) => tagColor === color);
}

export function getTagStyles(color: string): CSSProperties {
  const resolvedColor = isTagColor(color) ? color : "gray";

  return {
    "--badge-background": `var(--tag-${resolvedColor}-bg)`,
    "--badge-border": "transparent",
    "--badge-foreground": `var(--tag-${resolvedColor}-fg)`,
  } as CSSProperties;
}
