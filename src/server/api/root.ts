import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { candidateRouter } from "./routers/candidate";
import { activityRouter } from "./routers/activity";
import { candidateNoteRouter } from "./routers/candidate-note";
import { applicationRouter } from "./routers/application";
import { interviewsRouter } from "./routers/interviews";

export const appRouter = createTRPCRouter({
  candidate: candidateRouter,
  activity: activityRouter,
  candidateNote: candidateNoteRouter,
  application: applicationRouter,
  interview: interviewsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
