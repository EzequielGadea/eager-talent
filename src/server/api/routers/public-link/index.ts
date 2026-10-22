import { createTRPCRouter } from "~/server/api/trpc";

import { createPublicLink } from "./create";
import { getByToken } from "./get-by-token";
import { listByApplication } from "./list-by-application";
import { revokePublicLink } from "./revoke";

export { createPublicLink };
export { getByToken };
export { listByApplication };
export { revokePublicLink };

export const publicLinkRouter = createTRPCRouter({
  listByApplication,
  create: createPublicLink,
  revoke: revokePublicLink,
  getByToken,
});
