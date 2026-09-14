import { createTRPCRouter } from "~/server/api/trpc";

import { createApplicant } from "./create";
import { fetchAll } from "./fetch-all"
export { createApplicant };

export const applicantRouter = createTRPCRouter({
  createApplicant,
  fetchAll,
});