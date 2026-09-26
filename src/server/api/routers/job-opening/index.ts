import { createTRPCRouter } from "~/server/api/trpc";

import { getAllJobOpenings } from "./get-all";
import { getAllJobOpeningsDetailed } from "./get-all-detailed";
import { getJobOpeningsAmount } from "./get-amount";
import { getJobOpeningHiringManagers } from "./get-hiring-managers";

export { getAllJobOpenings };
export { getAllJobOpeningsDetailed };
export { getJobOpeningsAmount };
export { getJobOpeningHiringManagers };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  getAllJobOpeningsDetailed,
  getJobOpeningsAmount,
  getJobOpeningHiringManagers,
});
