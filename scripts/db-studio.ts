import { spawnSync } from "node:child_process";
import { getDatabaseUrl } from "../src/server/db/database-url";

const userArguments = process.argv.slice(2);
const hasExplicitUrl = userArguments.some(
  (argument) => argument === "--url" || argument.startsWith("--url="),
);

function getStudioUrl(): string {
  const url = new URL(getDatabaseUrl());

  const isPrismaDevDatabase =
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
    url.port === "51214" &&
    url.pathname === "/template1";

  if (isPrismaDevDatabase) {
    // Prisma Dev exposes a small PGlite connection server. A single Studio
    // connection avoids exhausting its concurrent connection limit while the
    // application is running alongside Studio.
    url.searchParams.set("max", "1");
    url.searchParams.set("prepare", "false");
  }

  return url.toString();
}

const prismaArguments = hasExplicitUrl
  ? userArguments
  : ["--url", getStudioUrl(), ...userArguments];

const result = spawnSync(
  process.execPath,
  ["x", "prisma", "studio", ...prismaArguments],
  { stdio: "inherit" },
);

if (result.error) {
  console.error("Unable to start Prisma Studio:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
