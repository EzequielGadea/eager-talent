import { randomUUID } from "node:crypto";
import * as z from "zod";
import { auth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

const ORG_NAME = "EagerWorks";
const ORG_SLUG = "eagerworks";

const CREATOR_ORG_ROLE = "owner";

const RESET_PASSWORD_REDIRECT = "/reset-password";

const firstUserSchema = z.object({
  email: z
    .string({ error: "FIRST_USER_EMAIL no está definida" })
    .trim()
    .toLowerCase()
    .email("FIRST_USER_EMAIL no es un correo válido"),
  name: z
    .string({ error: "FIRST_USER_NAME no está definida" })
    .trim()
    .min(1, "FIRST_USER_NAME no puede estar vacía")
    .max(100, "FIRST_USER_NAME no puede superar los 100 caracteres"),
});

async function ensureFirstUser(): Promise<string | null> {
  const userCount = await prisma.user.count();
  if (userCount > 0) return null;

  const parsed = firstUserSchema.safeParse({
    email: process.env.FIRST_USER_EMAIL,
    name: process.env.FIRST_USER_NAME,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.message).join("; ");
    console.error(`[bootstrap] No se pudo crear el primer usuario: ${issues}`);
    return null;
  }

  const { email, name } = parsed.data;

  await auth.api.createUser({
    body: { email, name, role: "admin" },
  });

  console.log(`[bootstrap] Primer usuario creado: ${email}`);
  return email;
}

async function ensureOrganization() {
  const existing = await prisma.organization.findFirst({
    where: { name: ORG_NAME },
    select: { id: true },
  });
  if (existing) return;

  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!firstUser) {
    console.error(
      "[bootstrap] No hay usuarios para ser creador de la organización.",
    );
    return;
  }

  const organizationId = randomUUID();
  const now = new Date();

  await prisma.$transaction([
    prisma.organization.create({
      data: {
        id: organizationId,
        name: ORG_NAME,
        slug: ORG_SLUG,
        createdAt: now,
      },
    }),
    prisma.member.create({
      data: {
        id: randomUUID(),
        organizationId,
        userId: firstUser.id,
        role: CREATOR_ORG_ROLE,
        createdAt: now,
      },
    }),
  ]);

  console.log(`[bootstrap] Organización ${ORG_NAME} creada.`);
}

async function sendPasswordReset(email: string) {
  await auth.api.requestPasswordReset({
    body: { email, redirectTo: RESET_PASSWORD_REDIRECT },
  });
  console.log(
    `[bootstrap] Correo de restablecimiento solicitado para ${email}`,
  );
}

export async function bootstrapFirstUser() {
  let createdEmail: string | null = null;

  try {
    createdEmail = await ensureFirstUser();
  } catch (err) {
    console.error("[bootstrap] Error creando el primer usuario:", err);
    return;
  }

  try {
    await ensureOrganization();
  } catch (err) {
    console.error("[bootstrap] Error creando la organización:", err);
  }

  if (createdEmail) {
    try {
      await sendPasswordReset(createdEmail);
    } catch (err) {
      console.error("[bootstrap] Error enviando el restablecimiento:", err);
    }
  }
}
