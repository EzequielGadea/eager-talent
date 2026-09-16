"use server";

import { api } from "~/lib/trpc/server";
import { transformApplicants } from "./types"

export async function getApplicantsPage(currentPage: number) {
  return api.applicant.fetchAll({ currentPage });
}