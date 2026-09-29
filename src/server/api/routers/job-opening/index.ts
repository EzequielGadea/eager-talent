import { createTRPCRouter } from "~/server/api/trpc";

import { fetchById } from "./fetch-by-id";
import { fetchPipelineCandidates } from "./fetch-pipeline-candidates";
import { getAllJobOpenings } from "./get-all";
import { getAllJobOpeningsDetailed } from "./get-all-detailed";
import { getJobOpeningsAmount } from "./get-amount";
import { listAssignableUsers } from "./list-assignable-users";
import { updateJobOpening } from "./update";
import { updateStatus } from "./update-status";
import { createJobOpening } from "./create";

export { fetchById };
export { fetchPipelineCandidates };
export { getAllJobOpenings };
export { getAllJobOpeningsDetailed };
export { getJobOpeningsAmount };
export { listAssignableUsers };
export { updateJobOpening };
export { updateStatus };
export { createJobOpening };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  getAllJobOpeningsDetailed,
  getJobOpeningsAmount,
  fetchById,
  fetchPipelineCandidates,
  updateStatus,
  createJobOpening,
  listAssignableUsers,
  update: updateJobOpening
});
