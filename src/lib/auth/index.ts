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
import { createAuthMiddleware } from "better-auth/api";
import { headers } from "next/headers";
import { UserStatus } from "~/generated/prisma/enums";
import { Prisma } from "~/generated/prisma/client";

const INVITATION_EXPIRATION = 60 * 60 * 24; // Un dia

type AuthHookContext = Parameters<
  Parameters<typeof createAuthMiddleware>[0]
>[0];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pgrupo632@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

async function setUserAsActive(ctx: AuthHookContext) {
  const session = ctx.context.newSession;
  if (!session) return;

  try {
    await prisma.user.update({
      where: {
        id: session.user.id,
        status: UserStatus.PendingInvitation,
      },
      data: { status: UserStatus.Active },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "2025")
      return;

    console.log(`Unable to update user ${session.user.id} state.`);
  }
}

export const auth = betterAuth({
  baseURL: {
    allowedHosts: ["*.vercel.app", "localhost:3000"],
    fallback: process.env.APP_URL,
  },
  user: {
    additionalFields: {
      customField: {
        type: "json",
        required: false,
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: INVITATION_EXPIRATION,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
    sendResetPassword: async ({ user, url, token }) => {
      const inv = await prisma.invitation.findFirst({
        where: { email: user.email, status: "pending" },
        orderBy: { createdAt: "desc" },
        include: { organization: true },
      });

      if (inv) {
        render(
          createElement(ConfirmEmail, {
            companyName: "Eager Talent",
            url: `${process.env.APP_URL}/accept-invite/${inv.id}?token=${token}`,
          }),
        )
          .then((emailHtml) => {
            transporter.sendMail({
              from: '"Eager Talent?" <pgrupo632@gmail.com>',
              to: user.email,
              subject: "Bienvenido a Eager Talent",
              html: emailHtml,
              textEncoding: "base64",
            });
            console.log(`Invitation email sent to ${user.email}`);
          })
          .catch((err) => {
            console.log(
              `Unable to send invitation email to ${user.email}, error ${err}`,
            );
          });
      } else {
        render(
          createElement(PasswordResetEmail, {
            url,
            companyName: "Eager Talent",
          }),
        )
          .then((emailHtml) => {
            transporter.sendMail({
              from: '"Eager Talent" <pgrupo632@gmail.com>',
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
      }
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: false,
      invitationExpiresIn: INVITATION_EXPIRATION,
      ac,
      roles,
      async sendInvitationEmail(data, request) {
        console.log(
          "Intentando enviar invitation email ",
          JSON.stringify(data),
        );
        await auth.api.createUser({
          body: {
            email: data.email,
            role: data.role === "recruiter" ? "admin" : "user",
            name: "",
          },
        });
        await auth.api.requestPasswordReset({
          body: {
            email: data.email,
            redirectTo: `/accept-invite/${data.id}`,
          },
          ...(request ? { request } : await headers()),
        });
      },
    }),
    admin(),
    // magicLink({
    //   sendMagicLink: async ({ email, url }) => {
    //     render(
    //       createElement(ConfirmEmail, { url, companyName: "Eager Talent" }),
    //     )
    //       .then((emailHtml) => {
    //         transporter.sendMail({
    //           from: '"Eager Talent?" <pgrupo632@gmail.com>',
    //           to: email,
    //           subject: "Accedé a tu cuenta de Eager Talent",
    //           html: emailHtml,
    //           textEncoding: "base64",
    //         });
    //         console.log(`Magic link successfully sent to ${email}`);
    //       })
    //       .catch((err) => {
    //         console.log(`Error sending Magic Link to ${email}, error: ${err}`);
    //       });
    //   },
    // }),
    nextCookies(),
  ],
  // hooks: {
  //   after: createAuthMiddleware(async (ctx) => {
  //     if (ctx.path === "/admin/create-user") {
  //       await bootstrapNewUser(ctx);
  //       return;
  //     }
  //     if (ctx.path === "/magic-link/verify") {
  //       await setUserAsActive(ctx);
  //       return;
  //     }
  //   }),
  // },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const member = await prisma.member.findFirst({
            where: { userId: session.userId },
            select: { organizationId: true },
          });

          return {
            data: {
              ...session,
              activeOrganizationId: member?.organizationId ?? null,
            },
          };
        },
      },
    },
  },
});
