import { APIError, type AuthContext } from "better-auth";

import { INVITATION_ALREADY_ACCEPTED } from "./invitation-errors";

type InvitationAuthContext = {
  adapter: Pick<AuthContext["adapter"], "findOne" | "deleteMany">;
  internalAdapter: Pick<
    AuthContext["internalAdapter"],
    "findUserByEmail" | "updateUser" | "listSessions" | "deleteSessions"
  >;
};

export async function revokeUnacceptedInvitation(
  context: InvitationAuthContext,
  invitation: { email: string; status: string },
) {
  // Cancelling would overwrite the status of an invitation that already
  // produced an active member.
  if (invitation.status === "accepted") {
    throw new APIError("BAD_REQUEST", {
      message:
        "La invitación ya fue aceptada y el usuario es miembro activo. No se canceló.",
      code: INVITATION_ALREADY_ACCEPTED,
    });
  }

  // A repeated cancellation must not revoke a newer invitation for this email.
  if (invitation.status !== "pending") return;

  const account = await context.internalAdapter.findUserByEmail(
    invitation.email,
  );
  if (!account) return;

  const userId = account.user.id;
  const membership = await context.adapter.findOne<{ id: string }>({
    model: "member",
    where: [{ field: "userId", value: userId }],
  });

  // Existing members may have legitimate roles, sessions and reset links.
  if (membership) return;

  await context.internalAdapter.updateUser(userId, { role: "user" });
  await context.adapter.deleteMany({
    model: "verification",
    where: [
      { field: "value", value: userId },
      {
        field: "identifier",
        operator: "starts_with",
        value: "reset-password:",
      },
    ],
  });

  const sessions = await context.internalAdapter.listSessions(userId);
  if (sessions.length > 0) {
    await context.internalAdapter.deleteSessions(
      sessions.map((session) => session.token),
    );
  }
}
