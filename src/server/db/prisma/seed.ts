import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "~/generated/prisma/client";
import { getDatabaseUrl } from "~/server/db/database-url";
import { assertSeedEnvironment } from "~/server/db/seed-environment";
import { seedDatabase } from "./seed-data";

async function main() {
  const databaseUrl = getDatabaseUrl();
  assertSeedEnvironment(databaseUrl);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    await seedDatabase(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "El seed falló.");
  process.exitCode = 1;
});
