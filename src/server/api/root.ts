import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { activityRouter } from "./routers/activity";
import { applicantRouter } from "./routers/applicant";
import { applicantNoteRouter } from "./routers/applicant-note";
import { applicationRouter } from "./routers/application";
import { interviewsRouter } from "./routers/interviews";
import { interviewNoteRouter } from "./routers/interview-note";
import { areaRouter } from "./routers/area";
import { jobOpeningRouter } from "./routers/job-opening";
import { publicLinkRouter } from "./routers/public-link";
import { jobRoleRouter } from "./routers/job-role";
import { searchRouter } from "./routers/search";
import { seniorityRouter } from "./routers/seniority";
import { tagRouter } from "./routers/tag";
import { userRouter } from "./routers/user";
import { templateStagesRouter } from "./routers/template-stages";
import { descalificationMotiveRouter } from "./routers/descalification-motive";

export const appRouter = createTRPCRouter({
  applicant: applicantRouter,
  activity: activityRouter,
  applicantNote: applicantNoteRouter,
  application: applicationRouter,
  interview: interviewsRouter,
  interviewNote: interviewNoteRouter,
  area: areaRouter,
  jobRole: jobRoleRouter,
  seniority: seniorityRouter,
  jobOpening: jobOpeningRouter,
  publicLink: publicLinkRouter,
  search: searchRouter,
  tag: tagRouter,
  user: userRouter,
  templateStages: templateStagesRouter,
  descalificationMotive: descalificationMotiveRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
