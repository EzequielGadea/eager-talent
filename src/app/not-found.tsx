import type { Metadata } from "next";

import { NotFoundCard } from "~/components/not-found-card";

export const metadata: Metadata = {
  title: "Página no encontrada | EagerTalent",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 bg-surface-subtle">
      <NotFoundCard />
    </main>
  );
}
