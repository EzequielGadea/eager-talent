import "server-only";

import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { cache } from "react";

import { api } from "~/lib/trpc/server";

export const getCandidate = cache(async (id: string) => {
  try {
    return await api.candidate.getById({ id });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
});
