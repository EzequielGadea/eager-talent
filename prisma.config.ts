import "dotenv/config";
import { defineConfig } from "prisma/config";
import {
  getDatabaseUrl,
  getShadowDatabaseUrl,
} from "./src/server/db/database-url";

export default defineConfig({
  schema: "src/server/db/prisma/schema.prisma",
  migrations: {
    path: "src/server/db/prisma/migrations",
    seed: "bun run src/server/db/prisma/seed.ts",
  },
  datasource: {
    url: getDatabaseUrl(),
    shadowDatabaseUrl: getShadowDatabaseUrl(),
  },
});
