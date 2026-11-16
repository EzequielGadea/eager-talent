import { createTRPCRouter } from "~/server/api/trpc";
import { getApplicantNoteByApplicantIdProcedure } from "./get-by-applicant-id";
import { saveApplicantNoteProcedure } from "./save";
import {
  importPeopleForceNotesProcedure,
  previewPeopleForceNotesProcedure,
} from "./import-peopleforce";

export const applicantNoteRouter = createTRPCRouter({
  getByApplicantId: getApplicantNoteByApplicantIdProcedure,
  save: saveApplicantNoteProcedure,
  previewPeopleForce: previewPeopleForceNotesProcedure,
  importPeopleForce: importPeopleForceNotesProcedure,
});
