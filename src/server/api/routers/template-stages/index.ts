import { createTRPCRouter } from "~/server/api/trpc";

import { getDefault } from "./get-default";

export { getDefault }
export const templateStagesRouter = createTRPCRouter({
  getDefault,
});
