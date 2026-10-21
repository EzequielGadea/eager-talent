import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  adminClient,
  magicLinkClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { ac, roles } from "~/lib/auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({ ac, roles }),
    magicLinkClient(),
    adminClient(),
    inferAdditionalFields({
      user: { lastName: { type: "string", required: false } },
    }),
  ],
});
