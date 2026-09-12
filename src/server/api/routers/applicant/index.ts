import { createTRPCRouter } from "~/server/api/trpc";

import { createApplicant } from "./create";
import { fetchAll } from "./fetch-all";
import { fetchAmount } from "./fetch-amount";

export { createApplicant };

export const applicantRouter = createTRPCRouter({
  fetchAll,
  fetchAmount,
  createApplicant,
});