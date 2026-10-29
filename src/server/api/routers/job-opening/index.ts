import { createTRPCRouter } from "~/server/api/trpc";

import { fetchById } from "./fetch-by-id";
import { fetchPipelineApplicants } from "./fetch-pipeline-applicants";
import { getAllJobOpenings } from "./get-all";
import { getAllOpenJobOpenings } from "./get-all-open";
import { getAllJobOpeningsDetailed } from "./get-all-detailed";
import { getJobOpeningsAmount } from "./get-amount";
import { getJobOpeningHiringManagers } from "./get-hiring-managers";
import { listAssignableUsers } from "./list-assignable-users";
import { updateJobOpening } from "./update";
import { updateStatus } from "./update-status";
import { createJobOpening } from "./create";
import { fetchDisqualifiedApplications } from "./fetch-disqualified-applications";

export { fetchById };
export { fetchPipelineApplicants };
export { getAllJobOpenings };
export { getAllOpenJobOpenings };
export { getAllJobOpeningsDetailed };
export { getJobOpeningsAmount };
export { getJobOpeningHiringManagers };
export { listAssignableUsers };
export { updateJobOpening };
export { updateStatus };
export { createJobOpening };
export { fetchDisqualifiedApplications };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  getAllOpenJobOpenings,
  getAllJobOpeningsDetailed,
  getJobOpeningsAmount,
  getJobOpeningHiringManagers,
  fetchById,
  fetchPipelineCandidates: fetchPipelineApplicants,
  fetchDisqualifiedApplications,
  updateStatus,
  createJobOpening,
  listAssignableUsers,
  update: updateJobOpening,
});
