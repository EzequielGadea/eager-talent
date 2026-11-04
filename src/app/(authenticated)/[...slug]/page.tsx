import { notFound } from "next/navigation";

// This route always throws, so there is no segment to validate for instant navigation.
export const instant = false;

// Unmatched URLs land here so the 404 renders inside the authenticated layout
// (sidebar and header) instead of the bare root not-found page.
export default function UnmatchedRoutePage() {
  notFound();
}
