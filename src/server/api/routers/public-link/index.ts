import { createTRPCRouter } from "~/server/api/trpc";

import { createPublicLink } from "./create";
import { listByApplication } from "./list-by-application";
import { revokePublicLink } from "./revoke";

export { createPublicLink };
export { listByApplication };
export { revokePublicLink };

export const publicLinkRouter = createTRPCRouter({
  listByApplication,
  create: createPublicLink,
  revoke: revokePublicLink,
});
