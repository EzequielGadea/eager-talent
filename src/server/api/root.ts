import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { applicantRouter } from "./routers/applicant";
import { areaRouter } from "./routers/area";
import { roleRouter } from "./routers/role";
import { seniorityRouter } from "./routers/seniority";
import { jobOpeningRouter } from "./routers/job-opening";

export const appRouter = createTRPCRouter({
  applicant: applicantRouter,
  area: areaRouter,
  role: roleRouter,
  seniority: seniorityRouter,
  jobOpening: jobOpeningRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
