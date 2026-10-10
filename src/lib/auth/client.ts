import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  adminClient,
  magicLinkClient,
} from "better-auth/client/plugins";
import { ac, roles } from "~/lib/auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({ ac, roles }),
    magicLinkClient(),
    adminClient(),
  ],
});
