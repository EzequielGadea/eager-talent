import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getDatabaseUrl } from "./src/server/db/database-url";

export default defineConfig({
  schema: "src/server/db/prisma/schema.prisma",
  migrations: {
    path: "src/server/db/prisma/migrations",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});