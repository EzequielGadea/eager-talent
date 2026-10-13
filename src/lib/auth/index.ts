import { betterAuth, APIError } from "better-auth";
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
import { z } from "zod";

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

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `No puede superar los ${PASSWORD_MAX_LENGTH} caracteres`,
  )
  .regex(/\p{Lu}/u, "Debe incluir al menos una letra mayúscula")
  .regex(/\p{Ll}/u, "Debe incluir al menos una letra minúscula")
  .regex(/\p{N}/u, "Debe incluir al menos un número")
  .regex(
    /[^\p{L}\p{N}\s]/u,
    "Debe incluir al menos un símbolo (por ejemplo ! @ # $ %)",
  );

const PASSWORD_FIELD_BY_PATH: Record<string, string> = {
  "/sign-up/email": "password",
  "/reset-password": "newPassword",
  "/change-password": "newPassword",
  "/set-password": "newPassword",
  "/admin/create-user": "password",
  "/admin/set-user-password": "newPassword",
};

const OPTIONAL_PASSWORD_PATHS = new Set(["/admin/create-user"]);

export const validatePasswordHook = createAuthMiddleware(async (ctx) => {
  const field = PASSWORD_FIELD_BY_PATH[ctx.path];
  if (!field) return;

  const value = (ctx.body as Record<string, unknown> | undefined)?.[field];

  if (
    OPTIONAL_PASSWORD_PATHS.has(ctx.path) &&
    (value === undefined || value === null || value === "")
  ) {
    return;
  }

  const result = passwordSchema.safeParse(value);
  if (result.success) return;

  if (result.error.issues.some((i) => i.code === "invalid_type")) {
    throw new APIError("BAD_REQUEST", {
      message: "La contraseña es obligatoria",
      code: "PASSWORD_REQUIRED",
    });
  }

  const issues = result.error.issues.map((i) => i.message);

  throw new APIError("BAD_REQUEST", {
    message: `La contraseña no cumple los requisitos: ${issues
      .map((m) => m.charAt(0).toLowerCase() + m.slice(1))
      .join("; ")}`,
    code: "PASSWORD_POLICY_VIOLATION",
    issues,
  });
});

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
    nextCookies(),
  ],
  hooks: {
    before: validatePasswordHook,
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
