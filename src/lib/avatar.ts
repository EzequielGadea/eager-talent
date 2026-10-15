const colors = [
  "bg-dashboard-orange-light text-dashboard-orange-text",
  "bg-dashboard-sky-avatar text-dashboard-sky-text",
  "bg-dashboard-success-avatar text-dashboard-success-text",
  "bg-tag-blue-bg text-tag-blue-fg",
  "bg-dashboard-purple-avatar text-dashboard-purple-text",
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
