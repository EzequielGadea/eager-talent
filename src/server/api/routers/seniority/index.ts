import { createTRPCRouter } from "~/server/api/trpc";

import { getAllSeniorities } from "./get-all";

import { updateOrderSeniority } from "./update-order";

export { getAllSeniorities, updateOrderSeniority };

export const seniorityRouter = createTRPCRouter({
  getAllSeniorities,
  updateOrderSeniority,
});
