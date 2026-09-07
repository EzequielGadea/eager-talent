import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { listCandidates } from "~logic/candidateService";

export const appRouter = createTRPCRouter({
    candidate: candidateRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);