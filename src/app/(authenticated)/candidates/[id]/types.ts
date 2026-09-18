import type { api } from "~/lib/trpc/server";

export type CandidatePromise = ReturnType<typeof api.candidate.getById>;
