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

async function bootstrapNewUser(ctx: AuthHookContext) {
  const organizationRole =
    ctx.body?.role === "admin" ? "recruiter" : "hiringManager";

  const returned = ctx.context.returned as
    { user?: { id: string; email: string; name: string } } | undefined;

  const user = returned?.user;
  if (!user) return;

  const reqHeaders = ctx.request?.headers ?? (await headers());

  const organization = await prisma.organization.findUniqueOrThrow({
    where: {
      slug: "eagerworks",
    },
  });

  const data = await auth.api.addMember({
    body: {
      userId: user.id,
      role: organizationRole,
      organizationId: organization.id,
    },
    headers: reqHeaders,
  });
  console.error("addMember data:", JSON.stringify(data));
  console.log(
    `User ${data.userId} has joined organization ${data.organizationId} at ${data.createdAt} with role ${data.role}.`,
  );

  await auth.api.signInMagicLink({
    body: {
      email: user.email,
      name: user.name,
      callbackURL: "/dashboard",
      newUserCallbackURL: "/dashboard",
      errorCallbackURL: "/error",
    },
    headers: reqHeaders,
  });

  await auth.api.requestPasswordReset({
    body: {
      email: user.email,
      redirectTo: "/reset-password",
    },
    ...(ctx.request ? { request: ctx.request } : { headers: await headers() }),
  });
}

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
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  plugins: [
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
    nextCookies(),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      console.log("[after hook] path:", ctx.path);
      if (ctx.path === "/admin/create-user") {
        await bootstrapNewUser(ctx);
        return;
      }
      if (ctx.path === "/magic-link/verify") {
        await setUserAsActive(ctx);
        return;
      }
    }),
  },
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
