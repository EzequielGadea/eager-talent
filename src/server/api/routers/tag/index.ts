import { createTRPCRouter } from "~/server/api/trpc";

import { getAllTags } from "./get-all";
import { createTag } from "./create";

export { getAllTags };
export { createTag };
export const tagRouter = createTRPCRouter({
  getAllTags,
  createTag,
});