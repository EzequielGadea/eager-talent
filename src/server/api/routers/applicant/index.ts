import { createTRPCRouter } from "~/server/api/trpc";
import { createApplicant } from "../candidate/create";
import { fetchAll } from "./fetch-all";
import { fetchAmount } from "./fetch-amount";

export const applicantRouter = createTRPCRouter({
  fetchAll,
  fetchAmount,
   createApplicant,
});
