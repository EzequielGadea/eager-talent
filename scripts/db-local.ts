import net from "node:net";
import path from "node:path";
import fs from "node:fs";
import { execSync, spawn } from "node:child_process";

const SERVER_NAME = "eager-talent";
const DB_PORT = 51214;
const MAIN_PORT = 51213;
const SHADOW_PORT = 51215;

type ServerStatus = "running" | "not_running" | "not_found";

function isPortOpen(port: number, host = "127.0.0.1"): Promise<boolean> {
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
    socket.connect(port, host);
  });
}

function getPrismaCliPath(): string {
  const localCli = path.resolve(
    process.cwd(),
    "node_modules/prisma/build/index.js",
  );
  if (fs.existsSync(localCli)) {
    return localCli;
  }
  return "prisma";
}

function getServerStatus(name: string): ServerStatus {
  try {
    const output = execSync("bun x prisma dev ls", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    const lines = output.split("\n");
    for (const line of lines) {
      if (line.includes(name)) {
        if (line.includes("running") && !line.includes("not_running")) {
          return "running";
        }
        if (line.includes("not_running")) {
          return "not_running";
        }
      }
    }
    return "not_found";
  } catch (error) {
    console.error("Failed to list Prisma Dev servers:", error);
    return "not_found";
  }
}

async function waitForPortReady(port: number, maxAttempts = 40): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isPortOpen(port)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timeout waiting for Prisma Dev database on port ${port}.`);
}

async function main() {
  const status = getServerStatus(SERVER_NAME);
  const portInUse = await isPortOpen(DB_PORT);

  if (status === "running") {
    console.log(
      `Prisma Dev instance '${SERVER_NAME}' is running. Checking readiness on port ${DB_PORT}...`,
    );
    if (portInUse) {
      console.log(
        `Prisma Dev database '${SERVER_NAME}' is ready on port ${DB_PORT}.`,
      );
      return;
    }
    await waitForPortReady(DB_PORT);
    console.log(
      `Prisma Dev database '${SERVER_NAME}' is ready on port ${DB_PORT}.`,
    );
    return;
  }

  // If the server is not running according to Prisma CLI, but the port is in use, fail safely.
  if (portInUse) {
    throw new Error(
      `Port ${DB_PORT} is already in use by an external process, but Prisma Dev instance '${SERVER_NAME}' status is '${status}'. Cannot start local database.`,
    );
  }

  if (status === "not_running") {
    console.log(
      `Starting existing Prisma Dev instance '${SERVER_NAME}' in background...`,
    );
    const cliPath = getPrismaCliPath();
    if (cliPath !== "prisma") {
      const runner = process.execPath.includes("node")
        ? process.execPath
        : "node";
      const child = spawn(runner, [cliPath, "dev", "start", SERVER_NAME], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
      child.unref();
    } else {
      const isWindows = process.platform === "win32";
      const child = isWindows
        ? spawn("cmd.exe", ["/c", `bun x prisma dev start ${SERVER_NAME}`], {
            detached: true,
            stdio: "ignore",
            windowsHide: true,
          })
        : spawn("bun", ["x", "prisma", "dev", "start", SERVER_NAME], {
            detached: true,
            stdio: "ignore",
          });
      child.unref();
    }

    await waitForPortReady(DB_PORT);
    console.log(
      `Prisma Dev database '${SERVER_NAME}' started and ready on port ${DB_PORT}.`,
    );
    return;
  }

  // status === "not_found"
  console.log(`Creating and starting Prisma Dev instance '${SERVER_NAME}'...`);
  execSync(
    `bun x prisma dev --name ${SERVER_NAME} --detach --port ${MAIN_PORT} --db-port ${DB_PORT} --shadow-db-port ${SHADOW_PORT}`,
    { stdio: "inherit" },
  );

  await waitForPortReady(DB_PORT);
  console.log(
    `Prisma Dev database '${SERVER_NAME}' created and ready on port ${DB_PORT}.`,
  );
}

main().catch((err) => {
  console.error("Error starting local database:", err.message || err);
  process.exit(1);
});
