import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { activityRouter } from "./routers/activity";
import { applicantRouter } from "./routers/applicant";
import { candidateRouter } from "./routers/candidate";

export const appRouter = createTRPCRouter({
  applicant: applicantRouter,
  candidate: candidateRouter,
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);