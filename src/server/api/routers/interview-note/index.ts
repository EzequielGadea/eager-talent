import { createTRPCRouter } from "~/server/api/trpc";
import { getInterviewNoteByInterviewIdProcedure } from "./get-by-interview-id";
import { saveInterviewNoteProcedure } from "./save";

export const interviewNoteRouter = createTRPCRouter({
  getByInterviewId: getInterviewNoteByInterviewIdProcedure,
  save: saveInterviewNoteProcedure,
});
