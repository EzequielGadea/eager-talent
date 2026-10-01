import { createTRPCRouter } from "~/server/api/trpc";

import { getAllJobOpenings } from "./get-all";
import { getAllJobOpeningsDetailed } from "./get-all-detailed";
import { getJobOpeningsAmount } from "./get-amount";
import { getJobOpeningHiringManagers } from "./get-hiring-managers";
import { fetchById } from "./fetch-by-id";
import { fetchPipelineCandidates } from "./fetch-pipeline-candidates";
import { updateStatus } from "./update-status";

export { getAllJobOpenings };
export { getAllJobOpeningsDetailed };
export { getJobOpeningsAmount };
export { getJobOpeningHiringManagers };
export { fetchById };
export { fetchPipelineCandidates };
export { updateStatus };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  getAllJobOpeningsDetailed,
  getJobOpeningsAmount,
  getJobOpeningHiringManagers,
  fetchById,
  fetchPipelineCandidates,
  updateStatus,
});
