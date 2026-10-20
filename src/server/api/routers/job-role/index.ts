import { createTRPCRouter } from "~/server/api/trpc";

import { getAllRoles } from "./get-all";

import { deleteRole } from "./delete-role";

import { createRole } from "./create-role";

export { getAllRoles, deleteRole, createRole };

export const jobRoleRouter = createTRPCRouter({
  getAllRoles,
  deleteRole,
  createRole,
});
