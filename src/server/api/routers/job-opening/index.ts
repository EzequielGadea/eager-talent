import { createTRPCRouter } from "~/server/api/trpc";

import { getAllJobOpenings } from "./get-all";
import { fetchById } from "./fetch-by-id";
import { fetchPipelineCandidates } from "./fetch-pipeline-candidates";

export { getAllJobOpenings };

export const jobOpeningRouter = createTRPCRouter({
  getAllJobOpenings,
  fetchById,
  fetchPipelineCandidates,
});
