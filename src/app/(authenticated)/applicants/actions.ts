"use server";

import { api } from "~/lib/trpc/server";

export async function getApplicantsPage(currentPage: number) {
  try {
    return api.applicant.fetchAll({ page: currentPage });
  } catch (e) {
    throw e;
  }
}
