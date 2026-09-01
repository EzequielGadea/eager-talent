import net from "node:net";
import { execFileSync } from "node:child_process";

const SERVER_NAME = "eager-talent";
const MAIN_PORT = 51213;
const DB_PORT = 51214;
const SHADOW_PORT = 51215;

const READY_RETRIES = 40;
const READY_DELAY_MS = 250;

type ServerStatus = "running" | "not_running" | "not_found";

function runPrisma(args: string[], captureOutput = false): string {
  const output = execFileSync(process.execPath, ["x", "prisma", ...args], {
    encoding: "utf-8",
    stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  return output ?? "";
}

function getServerStatus(): ServerStatus {
  const output = runPrisma(["dev", "ls"], true);

  for (const line of output.split(/\r?\n/)) {
    if (!line.includes(SERVER_NAME)) {
      continue;
    }

    if (line.includes("not_running")) {
      return "not_running";
    }

    if (line.includes("running")) {
      return "running";
    }
  }

  return "not_found";
}

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(500);

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, "127.0.0.1");
  });
}

async function waitForDatabase(): Promise<void> {
  for (let i = 0; i < READY_RETRIES; i++) {
    if (await isPortOpen(DB_PORT)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, READY_DELAY_MS));
  }

  throw new Error(
    `Prisma Dev database '${SERVER_NAME}' did not become ready on port ${DB_PORT}.`,
  );
}

async function main() {
  const status = getServerStatus();

  if (status === "running") {
    console.log(
      `Prisma Dev instance '${SERVER_NAME}' is running. Checking readiness on port ${DB_PORT}...`,
    );

    await waitForDatabase();

    console.log(
      `Prisma Dev database '${SERVER_NAME}' is ready on port ${DB_PORT}.`,
    );

    return;
  }

  if (await isPortOpen(DB_PORT)) {
    throw new Error(
      `Port ${DB_PORT} is already in use, but Prisma Dev instance '${SERVER_NAME}' is not running.`,
    );
  }

  if (status === "not_running") {
    console.log(`Starting existing Prisma Dev instance '${SERVER_NAME}'...`);

    runPrisma(["dev", "start", SERVER_NAME]);
  } else {
    console.log(
      `Creating and starting Prisma Dev instance '${SERVER_NAME}'...`,
    );

    runPrisma([
      "dev",
      "--name",
      SERVER_NAME,
      "--detach",
      "--port",
      String(MAIN_PORT),
      "--db-port",
      String(DB_PORT),
      "--shadow-db-port",
      String(SHADOW_PORT),
    ]);
  }

  await waitForDatabase();

  console.log(
    `Prisma Dev database '${SERVER_NAME}' started and ready on port ${DB_PORT}.`,
  );
}

main().catch((error) => {
  console.error("Error starting local database:", error);
  process.exit(1);
});