"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

const sortOptions = [
  { label: "Más recientes primero", selected: true },
  { label: "Más antiguas primero", selected: false },
  { label: "Título (A–Z)", selected: false },
  { label: "Más candidatos", selected: false },
  { label: "Menos candidatos", selected: false },
  { label: "Estado", selected: false },
];

export function JobOpeningSort() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-2 px-4 text-[13px] font-normal text-text-secondary"
          />
        }
      >
        Ordenar: Título
        <ChevronDown data-icon="inline-end" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 p-2">
        <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
          Ordenar por
        </p>

        <div className="flex flex-col gap-1">
          {sortOptions.map((option) => (
            <Button
              key={option.label}
              type="button"
              variant="ghost"
              aria-pressed={option.selected}
              className={`h-9 w-full justify-between rounded-lg px-3 text-sm ${
                option.selected
                  ? "bg-muted font-semibold text-text-primary hover:bg-muted"
                  : "font-normal text-text-primary"
              }`}
            >
              {option.label}

              {option.selected && (
                <Check className="size-4 text-accent-green-strong" />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
