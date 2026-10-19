export const USER_STATUSES = [
  "Active",
  "PendingInvitation",
  "Inactive",
  "Banned",
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

type GetUserStatusParams = {
  banned: boolean;
  isMember: boolean;
  invitations: { status: string; expiresAt: Date }[];
  now?: Date;
};

export function getUserStatus({
  banned,
  isMember,
  invitations,
  now = new Date(),
}: GetUserStatusParams): UserStatus {
  if (banned) {
    return "Banned";
  }

  if (isMember) {
    return "Active";
  }

  const hasValidPendingInvitation = invitations.some(
    (invitation) =>
      invitation.status === "pending" && invitation.expiresAt > now,
  );

  return hasValidPendingInvitation ? "PendingInvitation" : "Inactive";
}
