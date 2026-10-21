import { createTRPCRouter } from "~/server/api/trpc";

import { getAllRoles } from "./get-all";

import { deleteRole } from "../job-role/delete-role";

import { createRole } from "../job-role/create-role";

export { getAllRoles, deleteRole, createRole };

export const roleRouter = createTRPCRouter({
  getAllRoles,
  deleteRole,
  createRole,
});
