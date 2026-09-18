import { createTRPCRouter } from "~/server/api/trpc";

import { createApplicant } from "./create";
import { getApplicantById } from "./get-by-id";
import { updateApplicant } from "./update-applicant";


export { createApplicant };
export {getApplicantById};
export {updateApplicant};
export const applicantRouter = createTRPCRouter({
  createApplicant,
  getApplicantById,
  updateApplicant,
});
