"use client";

import { useId, useState } from "react";
import { Filter } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
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
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { api } from "~/lib/trpc/react";
import type { JobOpeningFilterInput } from "~/server/api/routers/job-opening/filter";
import { statusConfig } from "../constants";

const ALL_AREAS_VALUE = "all";
const ALL_HIRING_MANAGERS_VALUE = "all";
const ALL_OPENING_DATES_VALUE = "all";
const OPENING_DATE_RANGE_OPTIONS = [
  { label: "7 d", value: "7" },
  { label: "30 d", value: "30" },
  { label: "90 d", value: "90" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: NonNullable<JobOpeningFilterInput["openingDateRange"]>;
}>;

export type JobOpeningFiltersValue = {
  statuses: JobOpeningStatus[];
  areaId?: string;
  hiringManagerId?: string;
  openingDateRange?: JobOpeningFilterInput["openingDateRange"];
  onlyWithActiveCandidates: boolean;
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
  const areaLabelId = useId();
  const areaErrorId = useId();
  const hiringManagerLabelId = useId();
  const hiringManagerErrorId = useId();
  const openingDateLabelId = useId();
  const {
    data: areas = [],
    isLoading: isLoadingAreas,
    isFetching: isFetchingAreas,
    isError: isErrorAreas,
    refetch: refetchAreas,
  } = api.area.getAllAreas.useQuery({});
  const {
    data: hiringManagers = [],
    isLoading: isLoadingHiringManagers,
    isFetching: isFetchingHiringManagers,
    isError: isErrorHiringManagers,
    refetch: refetchHiringManagers,
  } = api.jobOpening.getJobOpeningHiringManagers.useQuery({});

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
    Number(Boolean(value.hiringManagerId)) +
    Number(Boolean(value.openingDateRange)) +
    Number(value.onlyWithActiveCandidates);
  const draftFilterCount =
    Number(draftFilters.statuses.length > 0) +
    Number(Boolean(draftFilters.areaId)) +
    Number(Boolean(draftFilters.hiringManagerId)) +
    Number(Boolean(draftFilters.openingDateRange)) +
    Number(draftFilters.onlyWithActiveCandidates);

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

  function updateOpeningDateRange(values: string[]) {
    const [value] = values;

    if (!value) {
      return;
    }

    const openingDateRange = OPENING_DATE_RANGE_OPTIONS.find(
      (option) => option.value === value,
    )?.value;

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      openingDateRange,
    }));
  }

  function updateOnlyWithActiveCandidates(checked: boolean) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      onlyWithActiveCandidates: checked,
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
            onClick={() =>
              setDraftFilters({
                statuses: [],
                onlyWithActiveCandidates: false,
              })
            }
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
          <legend
            id={areaLabelId}
            className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary"
          >
            Área
          </legend>

          <Select
            items={areaOptions}
            value={draftFilters.areaId ?? ALL_AREAS_VALUE}
            onValueChange={updateArea}
            disabled={isLoadingAreas || isFetchingAreas || isErrorAreas}
          >
            <SelectTrigger
              aria-labelledby={areaLabelId}
              aria-describedby={isErrorAreas ? areaErrorId : undefined}
              aria-invalid={isErrorAreas}
              className="mt-2 w-full"
            >
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
          {isErrorAreas && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription id={areaErrorId}>
                No se pudieron cargar las áreas.
              </AlertDescription>
              <Button
                type="button"
                variant="link"
                size="sm"
                disabled={isFetchingAreas}
                onClick={() => void refetchAreas()}
              >
                Reintentar
              </Button>
            </Alert>
          )}
        </fieldset>

        <fieldset className="px-4 pb-4">
          <legend
            id={hiringManagerLabelId}
            className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary"
          >
            Hiring Manager
          </legend>

          <Select
            items={hiringManagerOptions}
            value={draftFilters.hiringManagerId ?? ALL_HIRING_MANAGERS_VALUE}
            onValueChange={updateHiringManager}
            disabled={
              isLoadingHiringManagers ||
              isFetchingHiringManagers ||
              isErrorHiringManagers
            }
          >
            <SelectTrigger
              aria-labelledby={hiringManagerLabelId}
              aria-describedby={
                isErrorHiringManagers ? hiringManagerErrorId : undefined
              }
              aria-invalid={isErrorHiringManagers}
              className="mt-2 w-full"
            >
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
          {isErrorHiringManagers && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription id={hiringManagerErrorId}>
                No se pudieron cargar los Hiring Managers.
              </AlertDescription>
              <Button
                type="button"
                variant="link"
                size="sm"
                disabled={isFetchingHiringManagers}
                onClick={() => void refetchHiringManagers()}
              >
                Reintentar
              </Button>
            </Alert>
          )}
        </fieldset>
        {/*
          Recruiter assignment filter is pending.
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
        */}
        <fieldset className="px-4 pb-4">
          <legend
            id={openingDateLabelId}
            className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-tertiary"
          >
            Fecha de apertura
          </legend>

          <ToggleGroup
            value={[draftFilters.openingDateRange ?? ALL_OPENING_DATES_VALUE]}
            onValueChange={updateOpeningDateRange}
            aria-labelledby={openingDateLabelId}
            variant="outline"
            spacing={0}
            className="mt-2 grid w-full grid-cols-4"
          >
            {OPENING_DATE_RANGE_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={`Vacantes abiertas en los últimos ${option.value} días`}
                className="w-full text-text-secondary aria-pressed:border-primary aria-pressed:bg-primary! aria-pressed:text-primary-foreground! aria-pressed:hover:bg-primary!"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem
              value={ALL_OPENING_DATES_VALUE}
              aria-label="Vacantes de todas las fechas"
              className="w-full text-text-secondary aria-pressed:border-primary aria-pressed:bg-primary! aria-pressed:text-primary-foreground! aria-pressed:hover:bg-primary!"
            >
              Todas
            </ToggleGroupItem>
          </ToggleGroup>
        </fieldset>

        <div className="px-4 pb-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-normal text-text-primary">
            <Checkbox
              checked={draftFilters.onlyWithActiveCandidates}
              onCheckedChange={updateOnlyWithActiveCandidates}
              className="data-checked:border-accent-green data-checked:bg-accent-green"
            />
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
