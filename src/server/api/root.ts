import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { activityRouter } from "./routers/activity";
import { applicantRouter } from "./routers/applicant";
import { applicantNoteRouter } from "./routers/applicant-note";
import { applicationRouter } from "./routers/application";
import { interviewsRouter } from "./routers/interviews";
import { areaRouter } from "./routers/area";
import { jobOpeningRouter } from "./routers/job-opening";
import { roleRouter } from "./routers/job-role";
import { seniorityRouter } from "./routers/seniority";
import { tagRouter } from "./routers/tag";

export const appRouter = createTRPCRouter({
  applicant: applicantRouter,
  activity: activityRouter,
  applicantNote: applicantNoteRouter,
  application: applicationRouter,
  interview: interviewsRouter,
  area: areaRouter,
  role: roleRouter,
  seniority: seniorityRouter,
  jobOpening: jobOpeningRouter,
  tag: tagRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
