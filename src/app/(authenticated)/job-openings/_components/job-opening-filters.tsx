"use client";

import { useState } from "react";
import { Filter } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { api } from "~/lib/trpc/react";
import { statusConfig } from "../constants";

const ALL_AREAS_VALUE = "all";
const ALL_HIRING_MANAGERS_VALUE = "all";

export type JobOpeningFiltersValue = {
  statuses: JobOpeningStatus[];
  areaId?: string;
  hiringManagerId?: string;
};

export function JobOpeningFilters({
  value,
  onValueChange,
}: {
  value: JobOpeningFiltersValue;
  onValueChange: (value: JobOpeningFiltersValue) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(value);
  const { data: areas = [], isLoading: isLoadingAreas } =
    api.area.getAllAreas.useQuery({});
  const { data: hiringManagers = [], isLoading: isLoadingHiringManagers } =
    api.jobOpening.getJobOpeningHiringManagers.useQuery({});

  const areaOptions = [
    { label: "Todas las áreas", value: ALL_AREAS_VALUE },
    ...areas.map((area) => ({ label: area.name, value: area.id })),
  ];
  const hiringManagerOptions = [
    {
      label: "Todos los Hiring Managers",
      value: ALL_HIRING_MANAGERS_VALUE,
    },
    ...hiringManagers.map((hiringManager) => ({
      label: `${hiringManager.name} ${hiringManager.lastName}`.trim(),
      value: hiringManager.id,
    })),
  ];
  const activeFilterCount =
    Number(value.statuses.length > 0) +
    Number(Boolean(value.areaId)) +
    Number(Boolean(value.hiringManagerId));
  const draftFilterCount =
    Number(draftFilters.statuses.length > 0) +
    Number(Boolean(draftFilters.areaId)) +
    Number(Boolean(draftFilters.hiringManagerId));

  function handleOpenChange(open: boolean) {
    if (open) {
      setDraftFilters(value);
    }

    setIsOpen(open);
  }

  function updateStatus(status: JobOpeningStatus, checked: boolean) {
    setDraftFilters((currentFilters) => {
      const statuses = checked
        ? currentFilters.statuses.includes(status)
          ? currentFilters.statuses
          : [...currentFilters.statuses, status]
        : currentFilters.statuses.filter(
            (currentStatus) => currentStatus !== status,
          );

      return { ...currentFilters, statuses };
    });
  }

  function updateArea(areaId: string | null) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      areaId: areaId && areaId !== ALL_AREAS_VALUE ? areaId : undefined,
    }));
  }

  function updateHiringManager(hiringManagerId: string | null) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      hiringManagerId:
        hiringManagerId && hiringManagerId !== ALL_HIRING_MANAGERS_VALUE
          ? hiringManagerId
          : undefined,
    }));
  }

  function cancelChanges() {
    setDraftFilters(value);
    setIsOpen(false);
  }

  function applyFilters() {
    onValueChange(draftFilters);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
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
        {activeFilterCount > 0 && (
          <Badge
            variant="secondary"
            className="size-5 rounded-full p-0 text-[11px]"
          >
            {activeFilterCount}
          </Badge>
        )}
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
            disabled={draftFilterCount === 0}
            onClick={() => setDraftFilters({ statuses: [] })}
          >
            Limpiar
          </Button>
        </PopoverHeader>

        <fieldset className="mt-4 px-4 pt-2 pb-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
            Estado
          </legend>

          <div className="mt-1 flex flex-col gap-2">
            {Object.values(JobOpeningStatus).map((status) => {
              const config = statusConfig[status];

              return (
                <label
                  key={status}
                  className="flex cursor-pointer items-center gap-2 text-sm font-normal text-text-primary"
                >
                  <Checkbox
                    checked={draftFilters.statuses.includes(status)}
                    onCheckedChange={(checked) => updateStatus(status, checked)}
                    className="data-checked:border-accent-green data-checked:bg-accent-green"
                  />
                  <span>{config.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="px-4 pb-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
            Área
          </legend>

          <Select
            items={areaOptions}
            value={draftFilters.areaId ?? ALL_AREAS_VALUE}
            onValueChange={updateArea}
            disabled={isLoadingAreas}
          >
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Todas las áreas" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {areaOptions.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </fieldset>

        <fieldset className="px-4 pb-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
            Hiring Manager
          </legend>

          <Select
            items={hiringManagerOptions}
            value={draftFilters.hiringManagerId ?? ALL_HIRING_MANAGERS_VALUE}
            onValueChange={updateHiringManager}
            disabled={isLoadingHiringManagers}
          >
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Todos los Hiring Managers" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {hiringManagerOptions.map((hiringManager) => (
                  <SelectItem
                    key={hiringManager.value}
                    value={hiringManager.value}
                  >
                    {hiringManager.label}
                  </SelectItem>
                ))}
              </SelectGroup>
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
              <SelectGroup>
                <SelectItem value="all">Todos los reclutadores</SelectItem>
              </SelectGroup>
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
            onClick={cancelChanges}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            size="sm"
            className="rounded-full font-semibold"
            onClick={applyFilters}
          >
            Aplicar filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
