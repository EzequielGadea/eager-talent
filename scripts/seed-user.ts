import { PrismaClient } from "~/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "~/server/db/database-url";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { randomBytes } from "crypto";

function getAuth(prisma: PrismaClient) {
  const auth = betterAuth({
      baseURL: "http://localhost:3000",
      secret: randomBytes(32).toString("hex"),
      database: prismaAdapter(prisma, {
        provider: "postgresql",
        transaction: true,
      }),
      emailAndPassword: { enabled: true, autoSignIn: false },
      user: {
        additionalFields: {
          role: {
            type: ["Recruiter", "HiringManager"],
            defaultValue: "Recruiter",
            input: true,
          },
        },
      },
    });

    return auth;
}

async function main() {
  const email = "recruiter@eagerworks.com";

  const databaseUrl = getDatabaseUrl();
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("Usuario recruiter ya existe, no se crea de nuevo.");
    return;
  }

  const auth = getAuth(prisma);

  await auth.api.signUpEmail({
    body: {
      email,
      password: process.env.RECRUITER_SEED_PASSWORD!,
      name: "Recruiter",
      role: "Recruiter",
    },
  });

  console.log("Usuario recruiter creado.");
}

main().then(() => process.exit(0));
