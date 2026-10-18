import assert from "node:assert/strict";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { admin, organization } from "better-auth/plugins";

import { revokeUnacceptedInvitation } from "../src/lib/auth/invitation-lifecycle";
import { ac, roles } from "../src/lib/auth/permissions";

const baseURL = "http://localhost:3000";
const password = "Existing2026!x";

async function fixture({ active = false, hasPassword = false } = {}) {
  const store: Record<string, Record<string, unknown>[]> = {
    user: [],
    account: [],
    session: [],
    verification: [],
    organization: [],
    member: [],
    invitation: [],
  };
  const tokens = new Map<string, string>();
  const auth = betterAuth({
    baseURL,
    secret: "invitation-cancellation-isolated-tests-only-secret",
    database: memoryAdapter(store),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, token }) => {
        tokens.set(user.email, token);
      },
    },
    plugins: [
      organization({
        ac,
        roles,
        organizationHooks: {
          async beforeCancelInvitation({ invitation }) {
            await revokeUnacceptedInvitation(await auth.$context, invitation);
          },
        },
      }),
      admin(),
    ],
  });

  const owner = await auth.api.createUser({
    body: {
      email: "owner@example.com",
      name: "Owner",
      role: "admin",
      password,
    },
  });
  const invitee = await auth.api.createUser({
    body: {
      email: "invitee@example.com",
      name: "Invitee",
      role: "admin",
      ...(hasPassword ? { password } : {}),
    },
  });
  const context = await auth.$context;
  await context.adapter.create({
    model: "organization",
    forceAllowId: true,
    data: {
      id: "organization",
      name: "Test",
      slug: "test",
      createdAt: new Date(),
    },
  });
  await context.adapter.create({
    model: "member",
    forceAllowId: true,
    data: {
      id: "owner-member",
      userId: owner.user.id,
      organizationId: "organization",
      role: "recruiter",
      createdAt: new Date(),
    },
  });
  if (active) {
    await context.adapter.create({
      model: "organization",
      forceAllowId: true,
      data: {
        id: "other",
        name: "Other",
        slug: "other",
        createdAt: new Date(),
      },
    });
    await context.adapter.create({
      model: "member",
      forceAllowId: true,
      data: {
        id: "invitee-member",
        userId: invitee.user.id,
        organizationId: "other",
        role: "recruiter",
        createdAt: new Date(),
      },
    });
  }

  async function signIn(email: string) {
    const response = await auth.handler(
      new Request(`${baseURL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: baseURL },
        body: JSON.stringify({ email, password }),
      }),
    );
    assert.equal(response.status, 200);
    return new Headers({
      origin: baseURL,
      cookie: response.headers
        .getSetCookie()
        .map((c) => c.split(";")[0])
        .join("; "),
    });
  }

  const headers = await signIn(owner.user.email);
  const invitation = await auth.api.createInvitation({
    headers,
    body: {
      email: invitee.user.email,
      role: "recruiter",
      organizationId: "organization",
    },
  });
  await auth.api.requestPasswordReset({ body: { email: invitee.user.email } });
  const token = tokens.get(invitee.user.email)!;

  async function resetPassword(resetToken: string) {
    return auth.handler(
      new Request(`${baseURL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: baseURL },
        body: JSON.stringify({ token: resetToken, newPassword: password }),
      }),
    );
  }

  async function cancel(invitationId = invitation.id, callerHeaders = headers) {
    return auth.api.cancelInvitation({
      headers: callerHeaders,
      body: { invitationId },
    });
  }

  return {
    auth,
    context,
    store,
    tokens,
    owner,
    invitee,
    invitation,
    token,
    headers,
    signIn,
    resetPassword,
    cancel,
  };
}

test("a canceled invitation cannot set a password or retain global admin rights", async () => {
  const f = await fixture();
  await f.auth.api.requestPasswordReset({
    body: { email: f.owner.user.email },
  });
  const unrelatedToken = f.tokens.get(f.owner.user.email)!;
  await f.context.internalAdapter.createVerificationValue({
    identifier: "email-verification:unrelated",
    value: f.invitee.user.id,
    expiresAt: new Date(Date.now() + 60_000),
  });

  await f.cancel();
  assert.equal(f.store.invitation[0].status, "canceled");
  assert.equal(
    f.store.user.find((user) => user.id === f.invitee.user.id)?.role,
    "user",
  );
  const response = await f.resetPassword(f.token);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_TOKEN");
  assert.ok(
    f.store.verification.some(
      (v) => v.identifier === `reset-password:${unrelatedToken}`,
    ),
  );
  assert.ok(
    f.store.verification.some(
      (v) => v.identifier === "email-verification:unrelated",
    ),
  );
  assert.ok(
    !f.store.account.some((account) => account.userId === f.invitee.user.id),
  );
});

test("cancellation revokes a pending user's existing sessions and admin access", async () => {
  const f = await fixture({ hasPassword: true });
  const sessionHeaders = await f.signIn(f.invitee.user.email);
  assert.ok(await f.auth.api.getSession({ headers: sessionHeaders }));
  await f.cancel();
  assert.equal(await f.auth.api.getSession({ headers: sessionHeaders }), null);
  const newHeaders = await f.signIn(f.invitee.user.email);
  await assert.rejects(
    f.auth.api.listUsers({ headers: newHeaders, query: { limit: 1 } }),
    (error: { statusCode: number }) => error.statusCode === 403,
  );
});

test("canceling another organization's invitation preserves an active member's access", async () => {
  const f = await fixture({ active: true, hasPassword: true });
  const sessionHeaders = await f.signIn(f.invitee.user.email);
  await f.cancel();
  assert.equal(
    f.store.user.find((user) => user.id === f.invitee.user.id)?.role,
    "admin",
  );
  assert.ok(await f.auth.api.getSession({ headers: sessionHeaders }));
  assert.equal((await f.resetPassword(f.token)).status, 200);
});

test("an unauthorized cancellation does not revoke the invitee's token or role", async () => {
  const f = await fixture();
  const restricted = await f.auth.api.createUser({
    body: {
      email: "restricted@example.com",
      name: "Restricted",
      role: "user",
      password,
    },
  });
  await f.context.adapter.create({
    model: "member",
    forceAllowId: true,
    data: {
      id: "restricted-member",
      userId: restricted.user.id,
      organizationId: "organization",
      role: "hiringManager",
      createdAt: new Date(),
    },
  });
  const headers = await f.signIn(restricted.user.email);
  await assert.rejects(f.cancel(f.invitation.id, headers));
  assert.equal(f.store.invitation[0].status, "pending");
  assert.equal(
    f.store.user.find((user) => user.id === f.invitee.user.id)?.role,
    "admin",
  );
  assert.equal((await f.resetPassword(f.token)).status, 200);
});

test("canceling an old invitation again preserves the replacement invitation's link", async () => {
  const f = await fixture();
  await f.cancel();
  await f.context.internalAdapter.updateUser(f.invitee.user.id, {
    role: "admin",
  });
  await f.auth.api.createInvitation({
    headers: f.headers,
    body: {
      email: f.invitee.user.email,
      role: "recruiter",
      organizationId: "organization",
    },
  });
  await f.auth.api.requestPasswordReset({
    body: { email: f.invitee.user.email },
  });
  const replacement = f.tokens.get(f.invitee.user.email)!;
  await f.cancel();
  assert.equal(
    f.store.user.find((user) => user.id === f.invitee.user.id)?.role,
    "admin",
  );
  assert.equal((await f.resetPassword(replacement)).status, 200);
});

test("cleanup failure prevents the endpoint from reporting a successful cancellation", async () => {
  const f = await fixture();
  const deleteMany = f.context.adapter.deleteMany;
  f.context.adapter.deleteMany = async (input) => {
    if (input.model === "verification")
      throw new Error("Controlled cleanup failure");
    return deleteMany(input);
  };
  await assert.rejects(f.cancel(), /Controlled cleanup failure/);
  assert.equal(f.store.invitation[0].status, "pending");
});
