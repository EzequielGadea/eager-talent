import { Filter, Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function JobOpeningFilters() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-tertiary" />

        <Input
            type="text"
            placeholder="Buscar"
            className="h-8 w-48 rounded-lg pl-8 pr-2.5 text-sm"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
      >
        <Filter className="size-3.5" />
        Filtrar
      </Button>
    </div>
  );
}