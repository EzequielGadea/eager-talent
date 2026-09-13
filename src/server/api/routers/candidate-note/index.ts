import { createTRPCRouter } from "~/server/api/trpc";
import { getCandidateNoteByCandidateIdProcedure } from "./get-by-candidate-id";
import { saveCandidateNoteProcedure } from "./save";

export const candidateNoteRouter = createTRPCRouter({
  getByCandidateId: getCandidateNoteByCandidateIdProcedure,
  save: saveCandidateNoteProcedure,
});
