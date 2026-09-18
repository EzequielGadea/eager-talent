export function getSafeExternalUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function getExternalFileName(url: string): string | null {
  const fileName = new URL(url).pathname.split("/").pop();
  if (!fileName) return null;

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}
