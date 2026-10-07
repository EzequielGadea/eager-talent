import { createTRPCRouter } from "~/server/api/trpc";
import { listInterviewers } from "./list-interviewers";
import { getAllUsers } from "./get-all-users";

export const userRouter = createTRPCRouter({
  listInterviewers,
  getAllUsers,
});
