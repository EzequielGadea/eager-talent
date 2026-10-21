import type { JobOpeningStatus } from "~/generated/prisma/enums";

export function getApplicationStatusBadge(
  active: boolean,
  jobOpeningStatus: JobOpeningStatus = "Open",
) {
  if (!active) {
    return {
      label: "Descartado",
      badgeClass: "bg-danger-bg text-danger",
      dotClass: "bg-danger",
    };
  }

  switch (jobOpeningStatus) {
    case "Paused":
      return {
        label: "Pausada",
        badgeClass: "bg-warning-bg text-warning",
        dotClass: "bg-warning",
      };
    case "Closed":
      return {
        label: "Cerrada",
        badgeClass: "bg-tag-gray-bg text-tag-gray-fg",
        dotClass: "bg-tag-gray-fg",
      };
    case "Cancelled":
      return {
        label: "Cancelada",
        badgeClass: "bg-danger-bg text-danger",
        dotClass: "bg-danger",
      };
    default:
      return {
        label: "En proceso",
        badgeClass: "bg-info-bg text-info",
        dotClass: "bg-info",
      };
  }
}

