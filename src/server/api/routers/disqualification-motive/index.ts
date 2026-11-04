import { createTRPCRouter } from "~/server/api/trpc";

import { getAllDisqualificationMotive } from "./get-all";

import { deleteDisqualificationMotive } from "./delete-motive";

import { createDisqualificationMotive } from "./create-disqualification-motive";

export {
  getAllDisqualificationMotive,
  deleteDisqualificationMotive,
  createDisqualificationMotive,
};

export const disqualificationMotiveRouter = createTRPCRouter({
  getAllDisqualificationMotive,
  deleteDisqualificationMotive,
  createDisqualificationMotive,
});
