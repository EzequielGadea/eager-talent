import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { areaRouter } from "./routers/area";

export const appRouter = createTRPCRouter({
    area: areaRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
