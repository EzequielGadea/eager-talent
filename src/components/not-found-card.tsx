import { SearchX } from "lucide-react";

import { StatusCard } from "~/components/status-card";

export function NotFoundCard() {
  return (
    <StatusCard
      code="Error 404"
      icon={<SearchX className="size-6" aria-hidden="true" />}
      title="Página no encontrada"
      description="La página que buscás no existe o fue movida. Revisá la dirección e intentá nuevamente."
    />
  );
}
