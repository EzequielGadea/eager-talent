import { createTRPCRouter } from "~/server/api/trpc";

import { getAllSeniorities } from "./get-all";

import { updateOrderSeniority } from "./update-order";

import { createSeniority } from "./create-seniority";

import { deleteSeniority } from "./delete-seniority";

export {
  getAllSeniorities,
  updateOrderSeniority,
  createSeniority,
  deleteSeniority,
};

export const seniorityRouter = createTRPCRouter({
  getAllSeniorities,
  updateOrderSeniority,
  createSeniority,
  deleteSeniority,
});
