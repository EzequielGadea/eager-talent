import { createTRPCRouter } from "~/server/api/trpc";

import { getAllJobOpenings } from "./get-all";
import { getAllJobOpeningsDetailed } from "./get-all-detailed";
import { getJobOpeningsAmount } from "./get-amount";
import { fetchById } from "./fetch-by-id";
import { fetchPipelineCandidates } from "./fetch-pipeline-candidates";
import { updateStatus } from "./update-status";
import { createJobOpening } from "./create";

export { getAllJobOpenings };
export { getAllJobOpeningsDetailed };
export { getJobOpeningsAmount };
export { fetchById };
export { fetchPipelineCandidates };
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
});
