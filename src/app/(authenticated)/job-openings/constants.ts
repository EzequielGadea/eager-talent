import type { JobOpeningStatus } from "~/generated/prisma/enums";
import { jobOpeningStatusTranslations } from "~/lib/enum-translations";

export const statusConfig = {
  Open: {
    label: jobOpeningStatusTranslations.Open,
    className: "bg-success-bg text-success",
  },
  Paused: {
    label: jobOpeningStatusTranslations.Paused,
    className: "bg-warning-bg text-warning",
  },
  Closed: {
    label: jobOpeningStatusTranslations.Closed,
    className: "bg-tag-gray-bg text-tag-gray-fg",
  },
  Cancelled: {
    label: jobOpeningStatusTranslations.Cancelled,
    className: "bg-danger-bg text-danger",
  },
} satisfies Record<
  JobOpeningStatus,
  {
    label: string;
    className: string;
  }
>;
