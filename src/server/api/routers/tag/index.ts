import {createTRPCRouter} from "~/server/api/trpc";

import {  getAllTags } from "./get-all";

export { getAllTags};

export const tagRouter = createTRPCRouter({
  getAllTags,
});