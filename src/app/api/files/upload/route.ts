import { UTApi } from "uploadthing/server";

import { auth } from "~/lib/auth";

const utapi = new UTApi({ logLevel: "Error" });

// 4 MiB: leave room for multipart/form-data overhead under Vercel's approximate 4.5 MB request body limit.
const MAX_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

// Do not rely solely on file.type, as it is provided by the client.
// Check the file's leading bytes against its declared MIME type.
function matchesType(bytes: Uint8Array, type: string): boolean {
  const at = (signature: number[], offset = 0) =>
    signature.every((byte, i) => bytes[offset + i] === byte);

  switch (type) {
    case "application/pdf":
      return at([0x25, 0x50, 0x44, 0x46, 0x2d]);
    case "image/png":
      return at([0x89, 0x50, 0x4e, 0x47]);
    case "image/jpeg":
      return at([0xff, 0xd8, 0xff]);
    case "image/webp":
      return at([0x52, 0x49, 0x46, 0x46]) && at([0x57, 0x45, 0x42, 0x50], 8);
    case "image/gif":
      return (
        at([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
        at([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
      );
    default:
      return false;
  }
}

export async function POST(req: Request) {
  // Reject unauthenticated requests.
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ message: "No autorizado" }, { status: 401 });
  }

  // Parse the multipart form data and retrieve the uploaded file.
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  // Ensure a file was provided.
  if (!(file instanceof File)) {
    return Response.json({ message: "Archivo requerido" }, { status: 400 });
  }

  // Reject empty files.
  if (file.size === 0) {
    return Response.json({ message: "El archivo está vacío" }, { status: 400 });
  }

  // Enforce the maximum file size.
  if (file.size > MAX_SIZE) {
    return Response.json(
      { message: "El archivo supera el tamaño máximo de 4 MB" },
      { status: 413 },
    );
  }

  // Only allow supported file formats.
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { message: "Formato no permitido (PDF, PNG, JPG, WEBP o GIF)" },
      { status: 400 },
    );
  }

  // Read the first 12 bytes to inspect the file signature.
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  // Reject files whose content does not match their declared MIME type.
  if (!matchesType(head, file.type)) {
    return Response.json(
      { message: "El contenido no coincide con el tipo de archivo" },
      { status: 400 },
    );
  }

  // Upload the validated file to UploadThing from the server.
  const { data, error } = await utapi.uploadFiles(file);

  // Return an error if the upload fails.
  if (error || !data) {
    return Response.json(
      { message: "No se pudo subir el archivo" },
      { status: 502 },
    );
  }

  // Return the uploaded file's information to the client.
  return Response.json({
    url: data.ufsUrl,
    ufsUrl: data.ufsUrl,
    key: data.key,
    name: data.name,
  });
}
