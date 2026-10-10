import { createTRPCRouter } from "~/server/api/trpc";
import { getCurrent } from "./get-current";
import { listInterviewers } from "./list-interviewers";

export { getCurrent };
export { listInterviewers };

export const userRouter = createTRPCRouter({
  getCurrent,
  listInterviewers,
});
