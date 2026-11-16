export type PaginationEntry = number | "ellipsis";

const BOUNDARY_COUNT = 1;
const SIBLING_COUNT = 1;

function range(start: number, end: number) {
  return Array.from(
    { length: Math.max(end - start + 1, 0) },
    (_, i) => start + i,
  );
}

/**
 * Standard truncated pagination (same algorithm as Material UI's usePagination):
 * first and last page are always shown, plus the current page with its siblings.
 * Hidden ranges become an ellipsis, and the number of slots stays constant
 * (7 with the defaults) so the controls never change width between pages.
 * When every page fits in those slots, all of them are shown without ellipsis.
 */
export function getPaginationEntries(
  currentPage: number,
  totalPages: number,
): PaginationEntry[] {
  const startPages = range(1, Math.min(BOUNDARY_COUNT, totalPages));
  const endPages = range(
    Math.max(totalPages - BOUNDARY_COUNT + 1, BOUNDARY_COUNT + 1),
    totalPages,
  );

  const siblingsStart = Math.max(
    Math.min(
      currentPage - SIBLING_COUNT,
      totalPages - BOUNDARY_COUNT - SIBLING_COUNT * 2 - 1,
    ),
    BOUNDARY_COUNT + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(
      currentPage + SIBLING_COUNT,
      BOUNDARY_COUNT + SIBLING_COUNT * 2 + 2,
    ),
    endPages.length > 0 ? endPages[0]! - 2 : totalPages - 1,
  );

  const beforeSiblings: PaginationEntry[] =
    siblingsStart > BOUNDARY_COUNT + 2
      ? ["ellipsis"]
      : BOUNDARY_COUNT + 1 < totalPages - BOUNDARY_COUNT
        ? [BOUNDARY_COUNT + 1]
        : [];

  const afterSiblings: PaginationEntry[] =
    siblingsEnd < totalPages - BOUNDARY_COUNT - 1
      ? ["ellipsis"]
      : totalPages - BOUNDARY_COUNT > BOUNDARY_COUNT
        ? [totalPages - BOUNDARY_COUNT]
        : [];

  return [
    ...startPages,
    ...beforeSiblings,
    ...range(siblingsStart, siblingsEnd),
    ...afterSiblings,
    ...endPages,
  ];
}
