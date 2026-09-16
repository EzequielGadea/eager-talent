import { createTRPCRouter } from "~/server/api/trpc";

import { getAllRoles } from "./get-all";

export { getAllRoles };

export const roleRouter = createTRPCRouter({
  getAllRoles,
});