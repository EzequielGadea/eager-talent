"use client";

import { useState } from "react";
import { Filter } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { statusConfig } from "../constants";
import { Checkbox } from "~/components/ui/checkbox";

export function JobOpeningFilters() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Filtrar vacantes"
            className="h-8 gap-2 px-4 text-[13px] font-normal text-text-secondary has-data-[icon=inline-start]:pl-4"
          />
        }
      >
        <Filter data-icon="inline-start" />
        Filtrar
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 gap-0 p-0">
        <PopoverHeader className="flex-row items-center justify-between border-b border-dashboard-border px-4 py-3">
          <PopoverTitle className="font-semibold">
            Filtrar vacantes
          </PopoverTitle>

          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
          >
            Limpiar
          </Button>
        </PopoverHeader>

        <fieldset className="mt-4 px-4 pt-2 pb-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
            Estado
          </legend>

          <div className="mt-1 flex flex-col gap-2">
            {" "}
            {Object.entries(statusConfig).map(([status, config]) => (
              <label
                key={status}
                className="flex cursor-pointer items-center gap-2 text-sm font-normal text-text-primary"
              >
                <Checkbox className="data-checked:border-accent-green data-checked:bg-accent-green" />
                <span>{config.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="px-4 pb-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
            Área
          </legend>

          <Select>
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Todas las áreas" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
            </SelectContent>
          </Select>
        </fieldset>

        <fieldset className="px-4 pb-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
            Hiring Manager
          </legend>

          <Select>
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Todas los Hiring Manager" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todos los Hiring Manager</SelectItem>
            </SelectContent>
          </Select>
        </fieldset>

        <fieldset className="px-4 pb-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
            Reclutador a cargo
          </legend>

          <Select>
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Todas los reclutadores" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todos los reclutadores</SelectItem>
            </SelectContent>
          </Select>
        </fieldset>

        <fieldset className="px-4 pb-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
            Fecha de apertura
          </legend>

          <div className="mt-2 grid grid-cols-4">
            {" "}
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-l-lg rounded-r-none border border-dashboard-border border-r-0 text-text-secondary"
            >
              7 d
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-none border border-dashboard-border border-r-0 text-text-secondary"
            >
              30 d
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-none border border-dashboard-border text-text-secondary"
            >
              90 d
            </Button>
            <Button
              type="button"
              className="h-8 rounded-l-none rounded-r-lg border-primary"
            >
              Todas
            </Button>
          </div>
        </fieldset>

        <div className="px-4 pb-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-normal text-text-primary">
            <Checkbox className="data-checked:border-accent-green data-checked:bg-accent-green" />
            <span>Solo con candidatos en proceso</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-dashboard-border px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full font-semibold"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            size="sm"
            className="rounded-full font-semibold"
          >
            Aplicar filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
