"use server";

import { api } from "~/lib/trpc/server";

export async function getApplicantsPage(currentPage: number) {
  return api.applicant.fetchAll({ currentPage });
}
