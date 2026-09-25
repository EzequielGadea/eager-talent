import type { JobOpeningStatus } from "~/generated/prisma/enums";

export const statusConfig = {
  Open: {
    label: "Abierta",
    className: "bg-success-bg text-success",
  },
  Paused: {
    label: "Pausada",
    className: "bg-warning-bg text-warning",
  },
  Closed: {
    label: "Cerrada",
    className: "bg-tag-gray-bg text-tag-gray-fg",
  },
  Cancelled: {
    label: "Cancelada",
    className: "bg-danger-bg text-danger",
  },
} satisfies Record<
  JobOpeningStatus,
  {
    label: string;
    className: string;
  }
>;
