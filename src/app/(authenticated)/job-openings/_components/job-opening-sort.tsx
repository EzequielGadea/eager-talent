"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

import type { JobOpeningSortValue } from "~/server/api/routers/job-opening/sort";

type JobOpeningSortProps = {
  value: JobOpeningSortValue;
  onValueChange: (value: JobOpeningSortValue) => void;
};

const sortOptions = [
  {
    value: "newest",
    label: "Más recientes primero",
    triggerLabel: "Más recientes",
  },
  {
    value: "oldest",
    label: "Más antiguas primero",
    triggerLabel: "Más antiguas",
  },
  {
    value: "title-asc",
    label: "Título (A–Z)",
    triggerLabel: "Título",
  },
  {
    value: "applicants-desc",
    label: "Más candidatos",
    triggerLabel: "Más candidatos",
  },
  {
    value: "applicants-asc",
    label: "Menos candidatos",
    triggerLabel: "Menos candidatos",
  },
  {
    value: "status",
    label: "Estado",
    triggerLabel: "Estado",
  },
] satisfies Array<{
  value: JobOpeningSortValue;
  label: string;
  triggerLabel: string;
}>;

export function JobOpeningSort({ value, onValueChange }: JobOpeningSortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = sortOptions.find((option) => option.value === value);

  function selectOption(optionValue: JobOpeningSortValue) {
    onValueChange(optionValue);
    setIsOpen(false);
  }

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
        Ordenar: {selectedOption?.triggerLabel ?? "Más recientes"}
        <ChevronDown data-icon="inline-end" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 p-2">
        <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
          Ordenar por
        </p>

        <div className="flex flex-col gap-1">
          {sortOptions.map((option) => {
            const isSelected = option.value === value;

            return (
              <Button
                key={option.value}
                type="button"
                variant="ghost"
                aria-pressed={isSelected}
                onClick={() => selectOption(option.value)}
                className={cn(
                  "h-9 w-full justify-between rounded-lg px-3 text-sm",
                  isSelected
                    ? "bg-muted font-semibold text-text-primary hover:bg-muted"
                    : "font-normal text-text-primary",
                )}
              >
                {option.label}

                {isSelected ? (
                  <Check
                    data-icon="inline-end"
                    className="text-accent-green-strong"
                  />
                ) : null}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
