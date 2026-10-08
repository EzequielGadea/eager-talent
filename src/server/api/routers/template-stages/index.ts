import { createTRPCRouter } from "~/server/api/trpc";

import { getDefault } from "./get-default";
import { updateDefault } from "./update-default";

export { getDefault, updateDefault };
export const templateStagesRouter = createTRPCRouter({
  getDefault,
  updateDefault,
});
