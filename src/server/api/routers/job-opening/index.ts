import { createTRPCRouter } from "~/server/api/trpc";

import { fetchById } from "./fetch-by-id";
import { fetchPipelineCandidates } from "./fetch-pipeline-candidates";
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
import { getSelectionPipeline } from "./get-selection-pipeline";
import { closeStage } from "./close-stage";
import { reopenStage } from "./reopen-stage";
import { getStageMetrics } from "./get-stage-metrics";

export { fetchById };
export { fetchPipelineCandidates };
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
export { closeStage };
export { reopenStage };
export { getStageMetrics };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  getAllOpenJobOpenings,
  getAllJobOpeningsDetailed,
  getJobOpeningsAmount,
  getSelectionPipeline,
  getJobOpeningHiringManagers,
  fetchById,
  fetchPipelineCandidates,
  fetchDisqualifiedApplications,
  updateStatus,
  createJobOpening,
  listAssignableUsers,
  update: updateJobOpening,
  closeStage,
  reopenStage,
  getStageMetrics,
});
