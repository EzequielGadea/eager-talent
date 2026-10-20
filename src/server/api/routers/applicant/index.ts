import { createTRPCRouter } from "~/server/api/trpc";

import { createApplicant } from "./create";
import { updateApplicant } from "./update-applicant";
import { fetchAll } from "./fetch-all";
import { fetchAmount } from "./fetch-amount";
import { getApplicantByIdProcedure } from "./get-by-id";
import { fetchShared } from "./fetch-shared";
import { getSharingData } from "./get-sharing-data";
import { revokeHiringManagerAccess } from "./revoke-hiring-manager-access";
import { shareWithHiringManagers } from "./share-with-hiring-managers";
import { updateApplicantTags } from "./update-applicant-tags";
import { deleteApplicant } from "./delete-applicant";

export { getApplicantByIdProcedure };

export { createApplicant };
export { updateApplicant };
export { deleteApplicant };

export const applicantRouter = createTRPCRouter({
  createApplicant,
  getApplicantById: getApplicantByIdProcedure,
  getById: getApplicantByIdProcedure,
  updateApplicant,
  delete: deleteApplicant,
  fetchAll,
  fetchAmount,
  fetchShared,
  getSharingData,
  shareWithHiringManagers,
  revokeHiringManagerAccess,
  updateApplicantTags,
});
