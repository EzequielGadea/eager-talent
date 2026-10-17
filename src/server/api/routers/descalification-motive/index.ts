import { createTRPCRouter } from "~/server/api/trpc";

import { getAllDescalificationMotive } from "./get-all";

import { deleteDescalificationMotive } from "./delete-motive";

import { createDescalificationMotive } from "./create-descalification-motive";

export {
  getAllDescalificationMotive,
  deleteDescalificationMotive,
  createDescalificationMotive,
};

export const descalificationMotiveRouter = createTRPCRouter({
  getAllDescalificationMotive,
  deleteDescalificationMotive,
  createDescalificationMotive,
});
