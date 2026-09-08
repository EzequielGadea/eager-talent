import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { applicantRouter } from "./routers/applicant";
import { areaRouter } from "./routers/area";

export const appRouter = createTRPCRouter({
  applicant: applicantRouter,
  area: areaRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
