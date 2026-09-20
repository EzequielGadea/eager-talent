import { createTRPCRouter } from "~/server/api/trpc";

import { fetchAll } from "./fetch-all";
import { fetchAmount } from "./fetch-amount";
import { getApplicantByIdProcedure } from "./get-by-id";

export { getApplicantByIdProcedure };

export const applicantRouter = createTRPCRouter({
  fetchAll,
  fetchAmount,
  getById: getApplicantByIdProcedure,
});
