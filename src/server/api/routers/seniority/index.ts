import { createTRPCRouter } from "~/server/api/trpc";

import { getAllSeniorities } from "./get-all";

import { updateOrderSeniority } from "./update-order";

import { createSeniority } from "./create-seniority";

export { getAllSeniorities, updateOrderSeniority, createSeniority };

export const seniorityRouter = createTRPCRouter({
  getAllSeniorities,
  updateOrderSeniority,
  createSeniority,
});
