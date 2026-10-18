import { betterAuth, APIError } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { organization, admin } from "better-auth/plugins";
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
import { z } from "zod";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  passwordSchema,
} from "./password";

const INVITATION_EXPIRATION = 60 * 5; // 5 minutos

// No hay nada más permanente que una solución temporal.
//                                  - Confucio, 500 a.C.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, "Correo electrónico inválido"),
  role: z.enum(["recruiter", "hiringManager"]),
});

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
      lastName: {
        type: "string",
        required: false,
      },
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
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
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
        where: {
          email: user.email,
          status: "pending",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      try {
        if (inv) {
          const emailHtml = await render(
            createElement(ConfirmEmail, {
              companyName: "Eager Talent",
              url: `${process.env.APP_URL}/accept-invite/${inv.id}?token=${token}`,
            }),
          );

          await transporter.sendMail({
            from: `"Eager Talent" <${process.env.GOOGLE_EMAIL}>`,
            to: user.email,
            subject: "Bienvenido a Eager Talent",
            html: emailHtml,
            textEncoding: "base64",
          });

          console.log(`Invitation email sent to ${user.email}`);
        } else {
          const emailHtml = await render(
            createElement(PasswordResetEmail, {
              url,
              companyName: "Eager Talent",
            }),
          );

          await transporter.sendMail({
            from: `"Eager Talent" <${process.env.GOOGLE_EMAIL}>`,
            to: user.email,
            subject: "Restablecé tu contraseña",
            html: emailHtml,
            textEncoding: "base64",
          });

          console.log(`Password reset successfully sent to ${user.email}`);
        }
      } catch (err) {
        console.log(
          `Error while sending email to ${user.email}, error: ${err}`,
        );

        // Better Auth swallows errors thrown here, so callers detect the failure by the missing token
        await prisma.verification.deleteMany({
          where: { identifier: `reset-password:${token}` },
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
        const ctx = await auth.$context;
        const parsedInviteData = inviteSchema.safeParse(data);
        if (!parsedInviteData.success) {
          const issues = parsedInviteData.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }));

          throw new APIError("BAD_REQUEST", {
            message: issues.map((i) => `${i.field}: ${i.message}`).join("; "),
            code: "INVALID_INVITE_DATA",
            issues,
          });
        }

        const { email, role } = parsedInviteData.data;
        const existingUser = await ctx.internalAdapter.findUserByEmail(email);

        if (!existingUser) {
          await auth.api.createUser({
            headers: request?.headers,
            body: {
              email,
              role: role === "recruiter" ? "admin" : "user",
              name: "",
            },
          });
        }

        await auth.api.requestPasswordReset({
          body: {
            email,
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
