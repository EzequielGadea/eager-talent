import { createTRPCRouter } from "~/server/api/trpc";

import { getAllHiringManagers } from "./get-all-hm";

export { getAllHiringManagers };

export const usersRouter = createTRPCRouter({
  getAllHiringManagers,
});
