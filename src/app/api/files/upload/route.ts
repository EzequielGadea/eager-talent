import { randomUUID } from "node:crypto";

import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { UTApi } from "uploadthing/server";

import { auth } from "~/lib/auth";

const utapi = new UTApi({ logLevel: "Error" });

// 4 MiB: leave room for multipart/form-data overhead under Vercel's approximate 4.5 MB request body limit.
const MAX_SIZE = 4 * 1024 * 1024;

// Hard cap for the whole request body (file + multipart overhead).
// Must match the value used in proxy.ts.
const MAX_BODY = MAX_SIZE + 64 * 1024;

// Decoded size is driven by pixels, not by file size: a tiny file can expand
// to hundreds of MB. 16M pixels is about 4000x4000, plenty for photos and scans.
// For animated images this limit applies to width x height x frames.
const MAX_PIXELS = 16_000_000;

const MAX_PDF_PAGES = 50;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

// The extension is chosen by the server, never by the client.
const EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const SHARP_FORMAT: Record<string, "png" | "jpeg" | "webp" | "gif"> = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/webp": "webp",
  "image/gif": "gif",
};

// A well-formed, single-revision PDF ends at %%EOF (plus trivial whitespace).
// Anything appended after that marker is not part of the document a normal
// PDF reader opens; it can be arbitrary payload (HTML, a script, another
// file entirely) riding along inside a file whose header passes magic-byte
// checks.
function hasTrailingData(buf: Buffer): boolean {
  const text = buf.toString("latin1");
  const eofIndex = text.lastIndexOf("%%EOF");

  if (eofIndex === -1) return true; // no proper end marker at all

  const trailing = text.slice(eofIndex + "%%EOF".length);
  return trailing.trim().length > 0;
}

// PDF dictionary keys that introduce active/automatic behavior: running
// JavaScript, launching external programs or files, opening embedded files,
// or triggering actions when the document/page opens or a field changes.
// Matched as a PDF name token ("/JavaScript"), not a bare word, so it only
// fires on the actual structural key, not on unrelated text.
const FORBIDDEN_NAMES = [
  "JavaScript",
  "JS",
  "OpenAction",
  "AA",
  "Launch",
  "EmbeddedFile",
  "EmbeddedFiles",
  "RichMedia",
  "GoToE",
  "ImportData",
  "SubmitForm",
] as const;

const FORBIDDEN_NAME_PATTERNS = FORBIDDEN_NAMES.map(
  (name) => new RegExp(`/${name}(?![A-Za-z0-9])`),
);

// Literal markup that would render or execute as HTML/script if this file
// were ever served or opened with the wrong content type.
const FORBIDDEN_TEXT_PATTERNS = [
  /<\s*script/i,
  /<\s*html/i,
  /<\s*iframe/i,
  /<\s*embed/i,
  /<\s*object/i,
  /javascript:/i,
];

// Scans every indirect object pdf-lib parsed out of the document -- this
// includes objects pdf-lib has already decompressed out of /ObjStm object
// streams, and names it has already decoded from #XX hex escapes (so
// "/J#61vaScript" reads here as "/JavaScript"), which is why this check runs
// against the parsed object graph instead of a regex over the raw bytes.
function containsForbiddenContent(doc: PDFDocument): boolean {
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    const text = obj.toString();

    if (FORBIDDEN_NAME_PATTERNS.some((re) => re.test(text))) return true;
    if (FORBIDDEN_TEXT_PATTERNS.some((re) => re.test(text))) return true;
  }

  return false;
}

// Reject the file outright on any sign of active content -- JavaScript,
// auto-run actions, embedded files, or literal HTML/script markup -- rather
// than silently stripping it and uploading a "cleaned" version. The caller
// gets a plain rejection and has to find out what's wrong with the file
// themselves, instead of an upload that quietly lost part of its content.
async function sanitizePdf(buf: Buffer): Promise<Buffer | null> {
  // Cheap signature check before parsing anything.
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") return null;

  if (hasTrailingData(buf)) return null;

  try {
    // Throws on encrypted PDFs, which we cannot inspect anyway.
    const source = await PDFDocument.load(buf, { updateMetadata: false });

    if (source.getPageCount() === 0 || source.getPageCount() > MAX_PDF_PAGES) {
      return null;
    }

    if (containsForbiddenContent(source)) return null;

    // Re-save through pdf-lib even for a clean file: this still drops
    // anything pdf-lib did not need to reproduce the pages (unknown/unused
    // objects, broken structure) as a last line of defense, without
    // silently removing anything this check above was supposed to catch.
    return Buffer.from(await source.save());
  } catch {
    return null;
  }
}

// Decode and re-encode the image: this drops metadata and any payload appended
// after the pixel data. If it cannot be decoded, it is rejected.
async function sanitizeImage(
  buf: Buffer,
  type: string,
): Promise<Buffer | null> {
  const expected = SHARP_FORMAT[type];
  if (!expected) return null;

  try {
    const img = sharp(buf, {
      failOn: "error",
      limitInputPixels: MAX_PIXELS,
      animated: type === "image/gif",
    });

    // Only reads the header, so it is cheap to run before decoding.
    const meta = await img.metadata();
    if (meta.format !== expected) return null;

    const width = meta.width ?? 0;
    // For animated images "height" is the stacked height; pageHeight is per frame.
    const height = meta.pageHeight ?? meta.height ?? 0;
    const frames = meta.pages ?? 1;

    if (width === 0 || height === 0) return null;
    if (width * height * frames > MAX_PIXELS) return null;

    return await img.toFormat(expected).toBuffer();
  } catch {
    return null;
  }
}

// Read the body with a hard cap: stop as soon as the limit is exceeded,
// regardless of what Content-Length declares (it can lie or be chunked).
async function readLimited(req: Request, max: number): Promise<Buffer | null> {
  if (!req.body) return null;

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      return null;
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  // Reject unauthenticated requests.
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ message: "No autorizado" }, { status: 401 });
  }

  // Read the body with a hard cap before parsing it.
  const raw = await readLimited(req, MAX_BODY);

  if (!raw) {
    return Response.json(
      { message: "El archivo supera el tamaño máximo de 4 MB" },
      { status: 413 },
    );
  }

  // Parse the multipart form data and retrieve the uploaded file.
  const form = await new Response(new Uint8Array(raw), {
    headers: { "content-type": req.headers.get("content-type") ?? "" },
  })
    .formData()
    .catch(() => null);

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

  const type = file.type;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate the whole content and keep a clean version of it.
  // Magic bytes alone are not enough: the rest of the file can carry code.
  const clean =
    type === "application/pdf"
      ? await sanitizePdf(buffer)
      : await sanitizeImage(buffer, type);

  if (!clean) {
    return Response.json(
      { message: "El contenido no coincide con el tipo de archivo" },
      { status: 400 },
    );
  }

  // The client-provided file name is discarded: the server generates its own.
  const safeFile = new File(
    [new Uint8Array(clean)],
    `${randomUUID()}.${EXT[type]}`,
    { type },
  );

  // Upload the validated file to UploadThing from the server.
  const { data, error } = await utapi.uploadFiles(safeFile);

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
