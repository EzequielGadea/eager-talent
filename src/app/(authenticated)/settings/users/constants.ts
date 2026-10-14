export const userStatusConfig = {
  accepted: {
    label: "Activo",
    className: "bg-success-bg text-success",
  },
  pending: {
    label: "Invitación pendiente",
    className: "bg-warning-bg text-warning",
  },
  rejected: {
    label: "Invitación rechazada",
    className: "bg-tag-gray-bg text-tag-gray-fg",
  },
  canceled: {
    label: "Invitación cancelada",
    className: "bg-tag-gray-bg text-tag-gray-fg",
  },
} as const;

export const userRoleConfig = {
  recruiter: {
    label: "Recruiter",
    className: "bg-tag-purple-bg text-tag-purple-fg",
  },
  hiringManager: {
    label: "Hiring Manager",
    className: "bg-tag-gray-bg text-tag-gray-fg",
  },
} as const;
