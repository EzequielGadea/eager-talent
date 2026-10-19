import { createTRPCRouter } from "~/server/api/trpc";

import { getAllAreas } from "./get-all";

import { createArea } from "./create-area";

import { deleteArea } from "./delete-area";

export { getAllAreas, createArea, deleteArea };

export const areaRouter = createTRPCRouter({
  getAllAreas,
  createArea,
  deleteArea,
});
