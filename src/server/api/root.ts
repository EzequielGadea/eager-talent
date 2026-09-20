import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { applicantRouter } from "./routers/applicant";
import { activityRouter } from "./routers/activity";
import { applicantNoteRouter } from "./routers/applicant-note";
import { applicationRouter } from "./routers/application";
import { interviewsRouter } from "./routers/interviews";

export const appRouter = createTRPCRouter({
  applicant: applicantRouter,
  activity: activityRouter,
  applicantNote: applicantNoteRouter,
  application: applicationRouter,
  interview: interviewsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
