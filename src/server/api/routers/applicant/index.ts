import { createTRPCRouter } from "~/server/api/trpc";

import { createApplicant } from "./create";
import { getApplicantById } from "./get-by-id";
import { updateApplicant } from "./update-applicant";
import { fetchAll } from "./fetch-all";
import { fetchAmount } from "./fetch-amount";
import { getApplicantByIdProcedure } from "./get-by-id";

export { getApplicantByIdProcedure };


export { createApplicant };
export {getApplicantById};
export {updateApplicant};
export const applicantRouter = createTRPCRouter({
  createApplicant,
  getApplicantById,
  updateApplicant,
  fetchAll,
  fetchAmount,
  getById: getApplicantByIdProcedure,
});
