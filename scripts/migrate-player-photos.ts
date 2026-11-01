import { loadEnvConfig } from "@next/env";
import { UTApi } from "uploadthing/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

const SEED_FILE = path.join(process.cwd(), "src/server/db/prisma/seed-data.ts");

const EXPECTED_IMAGES = 15;

async function migratePlayerPhotos() {
  const token = process.env.UPLOADTHING_TOKEN;

  if (!token) {
    throw new Error("No se encontró UPLOADTHING_TOKEN.");
  }

  const utapi = new UTApi({ token });
  const source = await readFile(SEED_FILE, "utf-8");

  const photoRegex =
    /(photo:\s*)"https:\/\/img\.a\.transfermarkt\.technology\/[^"]+"/g;

  const matches = [...source.matchAll(photoRegex)];

  if (matches.length !== EXPECTED_IMAGES) {
    throw new Error(
      `Se esperaban ${EXPECTED_IMAGES} imágenes y se encontraron ${matches.length}.`,
    );
  }

  const urls = matches.map((match) => {
    const url = match[0].match(/"(https:\/\/[^"]+)"/)?.[1];

    if (!url) {
      throw new Error("No se pudo obtener una URL.");
    }

    return url;
  });

  const results = await utapi.uploadFilesFromUrl(
    urls.map((url, index) => ({
      url,
      name: `player-${index + 1}-${path.basename(new URL(url).pathname)}`,
    })),
    {
      contentDisposition: "inline",
      concurrency: 3,
    },
  );

  const newUrls = results.map((result, index) => {
    if (result.error || !result.data) {
      throw new Error(
        `Error al subir la imagen ${index + 1}: ${result.error?.message}`,
      );
    }

    return result.data.url;
  });

  let index = 0;

  const updatedSource = source.replace(photoRegex, (_match, prefix: string) => {
    return `${prefix}${JSON.stringify(newUrls[index++])}`;
  });

  await writeFile(SEED_FILE, updatedSource, "utf-8");

  console.log(`${newUrls.length} imágenes migradas correctamente.`);
}

migratePlayerPhotos().catch((error: unknown) => {
  console.error("Error durante la migración:", error);
  process.exitCode = 1;
});
