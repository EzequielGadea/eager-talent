import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { candidateRouter } from "./routers/candidate";
import { activityRouter } from "./routers/activity";

export const appRouter = createTRPCRouter({
  candidate: candidateRouter,
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
