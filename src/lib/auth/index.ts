import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { ac, roles } from "~/lib/auth/permissions";
import { prismaAdapter } from "@better-auth/prisma-adapter";

import { prisma } from "~/lib/prisma";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: ["*.vercel.app", "localhost:3000"],
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    organization({
      allowUserToCreateOrganization: false,
      ac,
      roles,
      async sendInvitationEmail(data) {
        // TODO: Replace this placeholder with Resend, SendGrid, SMTP, or another email provider.
        // Use data.email as the recipient and build a link containing data.id, for example:
        // const inviteLink = `${process.env.APP_URL}/accept-invitation/${data.id}`;
        // Send inviteLink to data.email from the configured email provider.
        // After login, the acceptance page calls:
        // authClient.organization.acceptInvitation({ invitationId: data.id });
        void data;
      },
    }),
  ],
});
