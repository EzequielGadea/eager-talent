import { createTRPCRouter } from "~/server/api/trpc";

import { getAllJobOpenings } from "./get-all";
import { getAllOpenJobOpenings } from "./get-all-open";
import { getAllJobOpeningsDetailed } from "./get-all-detailed";
import { getJobOpeningsAmount } from "./get-amount";
import { fetchById } from "./fetch-by-id";
import { fetchPipelineCandidates } from "./fetch-pipeline-candidates";
import { updateStatus } from "./update-status";

export { getAllJobOpenings };
export { getAllOpenJobOpenings };
export { getAllJobOpeningsDetailed };
export { getJobOpeningsAmount };
export { fetchById };
export { fetchPipelineCandidates };
export { updateStatus };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  getAllOpenJobOpenings,
  getAllJobOpeningsDetailed,
  getJobOpeningsAmount,
  fetchById,
  fetchPipelineCandidates,
  updateStatus,
});