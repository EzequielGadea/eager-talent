import { createTRPCRouter } from "~/server/api/trpc";
import { getCurrent } from "./get-current";
import { listInterviewers } from "./list-interviewers";
import { getAllUsers } from "./get-all-users";
import { deleteUser } from "./delete-user";

export { getCurrent };
export { listInterviewers };

export const userRouter = createTRPCRouter({
  getCurrent,
  listInterviewers,
  getAllUsers,
  delete: deleteUser,
});
