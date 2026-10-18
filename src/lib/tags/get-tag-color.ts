export const TAG_COLORS = [
  "green",
  "purple",
  "blue",
  "amber",
  "red",
  "gray",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export function getTagColor(name: string): TagColor {
  const normalizedName = name.trim().normalize("NFC").toLowerCase();

  let hash = 2166136261;

  for (let i = 0; i < normalizedName.length; i++) {
    hash ^= normalizedName.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const index = (hash >>> 0) % TAG_COLORS.length;

  return TAG_COLORS[index]!;
}
