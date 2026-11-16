// The UploadThing token is a base64-encoded JSON that contains the app id.
// Each developer uses their own UploadThing account, so the app id is read
// from the environment instead of being hardcoded.
export function getUploadthingAppId(): string | null {
  const token = process.env.UPLOADTHING_TOKEN;
  if (!token) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(token, "base64").toString("utf8"),
    ) as { appId?: unknown };
    return typeof decoded.appId === "string" ? decoded.appId : null;
  } catch {
    return null;
  }
}
