import { createTRPCRouter } from "~/server/api/trpc";

import { fetchAll } from "./fetch-all";
import { fetchAmount } from "./fetch-amount";

export const applicantRouter = createTRPCRouter({
  fetchAll,
  fetchAmount,
});