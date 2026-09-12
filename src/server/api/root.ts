import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { areaRouter } from "./routers/area";
import { roleRouter } from "./routers/role";
import { applicantRouter } from "./routers/applicant";
import { seniorityRouter } from "./routers/seniority";
import { jobOpeningRouter } from "./routers/job-opening";
import { tagRouter } from "./routers/tag";

export const appRouter = createTRPCRouter({
  area: areaRouter,
  role: roleRouter,
  seniority: seniorityRouter,
  jobOpening: jobOpeningRouter,
  tag: tagRouter,
  applicant: applicantRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
