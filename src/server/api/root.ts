import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
<<<<<<< HEAD
import { applicantRouter } from "./routers/applicant";

export const appRouter = createTRPCRouter({
    applicant: applicantRouter,
=======
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { listCandidates } from "~logic/candidateService";



export const candidateRouter = createTRPCRouter({
    fetchCandidates: publicProcedure
        .input(
            z.object({ //TODO agregar parametros para filtros, todos opcionales
                //<param1>: z.string().optional()
                //<param2>: z.number()
            }).optional()
        ) 
        .query(async ({input}) => {
            const result = await listCandidates(/*input*/);
            console.log("antes de ir a front");
            return {candidates: result};
        }),
})

export const appRouter = createTRPCRouter({
    candidate: candidateRouter,
>>>>>>> 33f27bc (prueba de agregar querie a DB y llamado trpc para consumir data)
});

export type AppRouter = typeof appRouter;

<<<<<<< HEAD
export const createCaller = createCallerFactory(appRouter);
=======
export const createCaller = createCallerFactory(appRouter);
export const createCallerCandidate = createCallerFactory(candidateRouter);

>>>>>>> 33f27bc (prueba de agregar querie a DB y llamado trpc para consumir data)
