import { createTRPCRouter } from "~/server/api/trpc";

import { createApplicant } from "./create";

export { createApplicant };

export const applicantRouter = createTRPCRouter({
  createApplicant,
});
