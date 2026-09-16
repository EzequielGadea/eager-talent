import { createTRPCRouter } from "~/server/api/trpc";

import { getAllAreas } from "./get-all";

export { getAllAreas };

export const areaRouter = createTRPCRouter({
  getAllAreas,
});