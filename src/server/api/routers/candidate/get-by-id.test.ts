import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { TRPCError } from "@trpc/server";

import type { Prisma } from "~/generated/prisma/client";
import { auth } from "~/lib/auth";
import { hiringManager } from "~/lib/auth/permissions";
import { createCaller } from "~/server/api/root";
import type { createTRPCContext } from "~/server/api/trpc";

type Context = Awaited<ReturnType<typeof createTRPCContext>>;
const originalHasPermission = auth.api.hasPermission;

// Stub Better Auth's decision; exercise the actual tRPC guards and query scoping.
before(() => {
  Object.defineProperty(auth.api, "hasPermission", {
    configurable: true,
    writable: true,
    value: async ({
      headers,
      body,
    }: {
      headers: Headers;
      body: { permissions: Record<string, string[]> };
    }) => {
      const granted = (headers.get("x-test-permissions") ?? "").split(",");
      return {
        success: Object.entries(body.permissions).every(([resource, actions]) =>
          actions.every((action) => granted.includes(`${resource}:${action}`)),
        ),
        error: null,
      };
    },
  });
});

after(() => {
  Object.defineProperty(auth.api, "hasPermission", {
    configurable: true,
    writable: true,
    value: originalHasPermission,
  });
});

function fixture({
  permissions = ["applicant:read", "activity:read"],
  assignedTo = "another-user",
  jobOpeningAssignedTo = "another-user",
  authenticated = true,
  candidateExists = true,
}: {
  permissions?: string[];
  assignedTo?: string;
  jobOpeningAssignedTo?: string;
  authenticated?: boolean;
  candidateExists?: boolean;
} = {}) {
  let candidateReads = 0;
  let activityReads = 0;

  function matchesCandidate(where: Prisma.ApplicantWhereInput): boolean {
    if (where.OR && !where.OR.some(matchesCandidate)) return false;
    if (where.hiringManagers?.some?.id) {
      return where.hiringManagers.some.id === assignedTo;
    }
    const assignedJobOpening = where.applications?.some
      ?.jobOpening as Prisma.JobOpeningWhereInput;
    if (assignedJobOpening?.hiringManagers?.some?.id) {
      return assignedJobOpening.hiringManagers.some.id === jobOpeningAssignedTo;
    }
    return true;
  }

  const db = {
    applicant: {
      findFirst: async (query: Prisma.ApplicantFindFirstArgs) => {
        candidateReads++;
        return candidateExists && matchesCandidate(query.where ?? {})
          ? { id: "candidate-1" }
          : null;
      },
    },
    application: { findMany: async () => [] },
    activity: {
      count: async () => {
        activityReads++;
        return 0;
      },
      findMany: async (query: Prisma.ActivityFindManyArgs) => {
        activityReads++;
        assert.deepEqual(query.where, { applicantId: "candidate-1" });
        return [];
      },
    },
  } as unknown as Context["db"];

  const session = {
    user: { id: "user-1" },
    session: { activeOrganizationId: "organization-1" },
  } as NonNullable<Context["session"]>;

  return {
    caller: createCaller({
      db,
      headers: new Headers({ "x-test-permissions": permissions.join(",") }),
      session: authenticated ? session : null,
    }),
    candidateReads: () => candidateReads,
    activityReads: () => activityReads,
  };
}

function errorCode(code: TRPCError["code"]) {
  return (error: unknown) => error instanceof TRPCError && error.code === code;
}

test("anonymous users cannot read candidate profiles or logs", async () => {
  const { caller, candidateReads, activityReads } = fixture({
    authenticated: false,
  });
  await assert.rejects(
    caller.candidate.getById({ id: "candidate-1" }),
    errorCode("UNAUTHORIZED"),
  );
  await assert.rejects(
    caller.activity.getByCandidateId({ candidateId: "candidate-1" }),
    errorCode("UNAUTHORIZED"),
  );
  assert.equal(candidateReads(), 0);
  assert.equal(activityReads(), 0);
});

test("denied applicant permissions prevent profile database reads", async () => {
  const { caller, candidateReads } = fixture({ permissions: [] });
  await assert.rejects(
    caller.candidate.getById({ id: "candidate-1" }),
    errorCode("FORBIDDEN"),
  );
  assert.equal(candidateReads(), 0);
});

test("full read permission allows unassigned profiles and logs", async () => {
  const { caller } = fixture();
  const candidate = await caller.candidate.getById({ id: "candidate-1" });
  assert.equal(candidate.id, "candidate-1");
  assert.equal("permissions" in candidate, false);
  const logs = await caller.activity.getByCandidateId({
    candidateId: "candidate-1",
  });
  assert.equal(logs.total, 0);
});

test("assigned read permission allows directly assigned candidates", async () => {
  const { caller } = fixture({
    permissions: ["applicant:readAssigned"],
    assignedTo: "user-1",
  });
  const candidate = await caller.candidate.getById({ id: "candidate-1" });
  assert.equal(candidate.id, "candidate-1");
});

test("assigned read permission also allows assignment through a job opening", async () => {
  const { caller } = fixture({
    permissions: ["applicant:readAssigned"],
    jobOpeningAssignedTo: "user-1",
  });
  const candidate = await caller.candidate.getById({ id: "candidate-1" });
  assert.equal(candidate.id, "candidate-1");
});

test("assigned read permission rejects candidates without either assignment", async () => {
  const { caller } = fixture({ permissions: ["applicant:readAssigned"] });
  await assert.rejects(
    caller.candidate.getById({ id: "candidate-1" }),
    errorCode("NOT_FOUND"),
  );
});

test("hiring managers have read permission for activities", () => {
  assert.equal(hiringManager.authorize({ activity: ["read"] }).success, true);
  assert.equal(
    hiringManager.authorize({ activity: ["update"] }).success,
    false,
  );
});

test("assigned readers see all candidate logs for either kind of assignment", async () => {
  for (const assignment of [
    { assignedTo: "user-1" },
    { jobOpeningAssignedTo: "user-1" },
  ]) {
    const { caller, activityReads } = fixture({
      permissions: ["activity:read", "applicant:readAssigned"],
      ...assignment,
    });
    const logs = await caller.activity.getByCandidateId({
      candidateId: "candidate-1",
    });
    assert.equal(logs.total, 0);
    assert.equal(activityReads(), 2);
  }
});

test("assigned readers cannot query logs of an unassigned candidate", async () => {
  const { caller, activityReads } = fixture({
    permissions: ["activity:read", "applicant:readAssigned"],
  });
  await assert.rejects(
    caller.activity.getByCandidateId({ candidateId: "candidate-1" }),
    errorCode("NOT_FOUND"),
  );
  assert.equal(activityReads(), 0);
});

test("logs require activity read and a candidate read permission", async () => {
  for (const permissions of [
    ["applicant:readAssigned"],
    ["applicant:read"],
    ["activity:read"],
  ]) {
    const { caller, candidateReads, activityReads } = fixture({ permissions });
    await assert.rejects(
      caller.activity.getByCandidateId({ candidateId: "candidate-1" }),
      errorCode("FORBIDDEN"),
    );
    assert.equal(candidateReads(), 0);
    assert.equal(activityReads(), 0);
  }
});

test("missing candidates do not expose activity data", async () => {
  const { caller, activityReads } = fixture({ candidateExists: false });
  await assert.rejects(
    caller.candidate.getById({ id: "candidate-1" }),
    errorCode("NOT_FOUND"),
  );
  await assert.rejects(
    caller.activity.getByCandidateId({ candidateId: "candidate-1" }),
    errorCode("NOT_FOUND"),
  );
  assert.equal(activityReads(), 0);
});
