import { createTRPCRouter } from "~/server/api/trpc";

import { globalSearch } from "./global-search";

export { globalSearch };

export const searchRouter = createTRPCRouter({
  global: globalSearch,
});
