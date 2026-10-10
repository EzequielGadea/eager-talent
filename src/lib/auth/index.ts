import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink, organization, admin } from "better-auth/plugins";
import { ac, roles } from "~/lib/auth/permissions";
import { prismaAdapter } from "@better-auth/prisma-adapter";

import { prisma } from "~/lib/prisma";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { ConfirmEmail } from "~/emails/activation";
import { PasswordResetEmail } from "~/emails/password-reset";
import { createElement } from "react";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pgrupo632@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export const auth = betterAuth({
  baseURL: {
    allowedHosts: ["*.vercel.app", "localhost:3000"],
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
    sendResetPassword: async ({ user, url }) => {
      render(
        createElement(PasswordResetEmail, { url, companyName: "Eager Talent" }),
      )
        .then((emailHtml) => {
          transporter.sendMail({
            from: '"Eager Talent" <pgrupo0632@gmail.com>',
            to: user.email,
            subject: "Restablecé tu contraseña",
            html: emailHtml,
            textEncoding: "base64",
          });

          console.log(`Password reset successfully sent to ${user.email}`);
        })
        .catch((err) => {
          console.log(
            `Error while sending password reset to ${user.email}, error: ${err}`,
          );
        });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
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
    admin(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        render(
          createElement(ConfirmEmail, { url, companyName: "Eager Talent" }),
        )
          .then((emailHtml) => {
            transporter.sendMail({
              from: '"Eager Talent?" <pgrupo632@gmail.com>',
              to: email,
              subject: "Accedé a tu cuenta de Eager Talent",
              html: emailHtml,
              textEncoding: "base64",
            });
            console.log(`Magic link successfully sent to ${email}`);
          })
          .catch((err) => {
            console.log(`Error sending Magic Link to ${email}, error: ${err}`);
          });
      },
    }),
  ],
});
