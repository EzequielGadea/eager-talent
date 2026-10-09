export const userStatusConfig = {
  Active: {
    label: "Activo",
    className: "bg-success-bg text-success",
  },
  PendingInvitation: {
    label: "Invitación pendiente",
    className: "bg-warning-bg text-warning",
  },
  Inactive: {
    label: "Inactivo",
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
