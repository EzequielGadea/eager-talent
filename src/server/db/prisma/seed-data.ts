import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import type { PrismaClient } from "~/generated/prisma/client";

const ADMIN_EMAIL = "admin@example.com";

export async function seedDatabase(prisma: PrismaClient): Promise<void> {

  // TEST ADMIN USER
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== "Recruiter") {
      throw new Error(
        `Ya existe ${ADMIN_EMAIL} con otro rol.`,
      );
    }
    console.log(`El usuario de prueba ${ADMIN_EMAIL} ya existe; se conserva.`);
  } else {
    const seedAuth = betterAuth({
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
            input: false,
          },
        },
      },
    });

    await seedAuth.api.signUpEmail({
      body: {
        name: "Admin de prueba",
        email: ADMIN_EMAIL,
        password: "admin123",
      },
    });
    console.log(`Usuario de prueba creado: ${ADMIN_EMAIL} (Recruiter).`);
  }


  //A PARTIR DE AQUI SE PUEDEN AGREGAR DATOS DE PRUEBA

}
