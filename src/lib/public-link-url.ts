// Single place that defines where public application links live. The public
// page itself is implemented in a later task.
export const PUBLIC_LINK_BASE_PATH = "/p";

export function getPublicLinkUrl(token: string, origin: string) {
  return new URL(
    `${PUBLIC_LINK_BASE_PATH}/${encodeURIComponent(token)}`,
    origin,
  ).toString();
}
