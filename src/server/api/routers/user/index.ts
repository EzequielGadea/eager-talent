import { createTRPCRouter } from "~/server/api/trpc";
import { listInterviewers } from "./list-interviewers";

export const userRouter = createTRPCRouter({
  listInterviewers,
});
