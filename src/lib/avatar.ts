const colors = [
  "bg-tag-amber-bg text-tag-amber-fg",
  "bg-tag-blue-bg text-tag-blue-fg",
  "bg-tag-green-bg text-tag-green-fg",
  "bg-tag-blue-bg text-tag-blue-fg",
  "bg-tag-purple-bg text-tag-purple-fg",
  "bg-tag-amber-bg text-tag-amber-fg",
] as const;

export default function getAvatar(name: string, lastName: string) {
  const fullName = `${name.trim()} ${lastName.trim()}`;
  const hash = [...fullName].reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );

  return {
    initials:
      `${name.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase(),
    colorClass: colors[hash % colors.length],
  };
}
