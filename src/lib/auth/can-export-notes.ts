export function canExportNotes(role: string | null | undefined): boolean {
  return role === "recruiter" || role === "owner";
}
