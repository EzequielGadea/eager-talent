import { createTRPCRouter } from "~/server/api/trpc";

import { getAllJobOpenings } from "./get-all";
import { getJobOpeningsAmount } from "./get-amount";

import { getAllJobOpeningsDetailed } from "./get-all-detailed";
export { getAllJobOpenings };
export { getAllJobOpeningsDetailed };
export { getJobOpeningsAmount };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  getAllJobOpeningsDetailed,
  getJobOpeningsAmount,
});
