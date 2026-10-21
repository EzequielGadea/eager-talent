import { createTRPCRouter } from "~/server/api/trpc";
import { getApplicantNoteByApplicantIdProcedure } from "./get-by-applicant-id";
import { saveApplicantNoteProcedure } from "./save";

export const applicantNoteRouter = createTRPCRouter({
  getByApplicantId: getApplicantNoteByApplicantIdProcedure,
  save: saveApplicantNoteProcedure,
});
