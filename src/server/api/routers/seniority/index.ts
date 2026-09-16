import { createTRPCRouter } from "~/server/api/trpc";

import { getAllSeniorities } from "./get-all";

export { getAllSeniorities };

export const seniorityRouter = createTRPCRouter({
  getAllSeniorities,
});