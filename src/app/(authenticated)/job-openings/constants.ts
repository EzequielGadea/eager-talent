import type { JobOpeningStatus } from "~/generated/prisma/enums";
import { jobOpeningStatusTranslations } from "~/lib/enum-translations";

export const ITEMS_PER_PAGE = 8;

export const statusConfig = {
  Open: {
    label: jobOpeningStatusTranslations.Open,
    className: "bg-success-bg text-success",
    dotClassName: "bg-success",
  },
  Paused: {
    label: jobOpeningStatusTranslations.Paused,
    className: "bg-warning-bg text-warning",
    dotClassName: "bg-warning",
  },
  Closed: {
    label: jobOpeningStatusTranslations.Closed,
    className: "bg-tag-gray-bg text-tag-gray-fg",
    dotClassName: "bg-tag-gray-fg",
  },
  Cancelled: {
    label: jobOpeningStatusTranslations.Cancelled,
    className: "bg-danger-bg text-danger",
    dotClassName: "bg-danger",
  },
  Draft: {
    label: jobOpeningStatusTranslations.Draft,
    className: "bg-info-bg text-info",
    dotClassName: "bg-info",
  },
} satisfies Record<
  JobOpeningStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
>;
