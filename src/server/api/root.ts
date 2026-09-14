import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { applicantRouter } from "./routers/applicant";

export const appRouter = createTRPCRouter({
    applicant: applicantRouter,
});

export type AppRouter = typeof appRouter;
export type CandidateRouter = typeof candidateRouter;

export const createCaller = createCallerFactory(appRouter);