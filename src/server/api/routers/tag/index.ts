import { createTRPCRouter } from "~/server/api/trpc";

import { getAllTags } from "./get-all";
import { createTag } from "./create";
import { deleteTag } from "./delete-tag";

export { getAllTags, createTag, deleteTag };

export const tagRouter = createTRPCRouter({
  getAllTags,
  createTag,
  deleteTag,
});
