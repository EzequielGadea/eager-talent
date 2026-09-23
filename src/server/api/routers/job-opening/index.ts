import { createTRPCRouter } from "~/server/api/trpc";

import { getAllJobOpenings } from "./get-all";

import { createJobOpening } from "./create";
export { getAllJobOpenings, createJobOpening };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  createJobOpening,
});
