import { createTRPCRouter } from "~/server/api/trpc";

import { getAllJobOpenings } from "./get-all";

export { getAllJobOpenings };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
});