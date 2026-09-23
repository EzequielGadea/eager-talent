"use client";

import { ChevronDown, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { FilterKey, FiltersProps } from "../types";
import { Source } from "~/generated/prisma/enums";
import { cn } from "~/lib/utils";

export function Filters({
  roleData,
  seniorityData,
  areaData,
  jobOpeningData,
  tagData,
}: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(searchParam);
  const [previousSearchParam, setPreviousSearchParam] = useState(searchParam);
  const [optionSearch, setOptionSearch] = useState("");
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  if (previousSearchParam !== searchParam) {
    setPreviousSearchParam(searchParam);
    setSearchValue(searchParam);
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (term.trim()) {
      params.set("search", term.trim());
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  const filterGroups = [
    {
      key: "jobOpening" as const,
      label: "Todas las vacantes",
      options: jobOpeningData.map((item) => ({
        id: item.id,
        label: item.name,
      })),
    },
    {
      key: "role" as const,
      label: "Todos los roles",
      options: roleData.map((item) => ({ id: item.id, label: item.name })),
    },
    {
      key: "seniority" as const,
      label: "Seniority",
      options: seniorityData.map((item) => ({ id: item.id, label: item.name })),
    },
    {
      key: "area" as const,
      label: "Área",
      options: areaData.map((item) => ({ id: item.id, label: item.name })),
    },
    {
      key: "source" as const,
      label: "Fuente",
      options: Object.values(Source).map((value) => ({
        id: value,
        label: value,
      })),
    },
    {
      key: "tag" as const,
      label: "Etiquetas",
      options: tagData.map((item) => ({
        id: item.id,
        label: item.name,
        color: item.color,
      })),
    },
  ];

  const [selectedFilters, setSelectedFilters] = useState<
  Record<FilterKey, Set<string>>
>(() => ({
  jobOpening: new Set(searchParams.getAll("jobOpening")),
  role: new Set(searchParams.getAll("role")),
  seniority: new Set(searchParams.getAll("seniority")),
  area: new Set(searchParams.getAll("area")),
  source: new Set(searchParams.getAll("source")),
  tag: new Set(searchParams.getAll("tag")),
}));


  const updateFilterValue = (
    key: FilterKey,
    value: string,
    checked: boolean,
  ) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev[key]);
      if (checked) {
        next.add(value);
      } else {
        next.delete(value);
      }
          return {
      ...prev,
      [key]: next,
    };
    });
    const params = new URLSearchParams(searchParams.toString());
    const selectedValues = new Set(params.getAll(key));

    if (checked) {
      selectedValues.add(value);
    } else {
      selectedValues.delete(value);
    }

    params.delete(key);
    params.set("page", "1");
    for (const item of selectedValues) {
      params.append(key, item);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilter = (key: FilterKey) => {
    setSelectedFilters((prev) => {
      const next = new Set();
          return {
      ...prev,
      [key]: next,
    };
    })
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="relative w-56 shrink-0">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dashboard-text-muted"
        />

        <Input
          type="text"
          value={searchValue}
          onChange={(event) => {
            const value = event.target.value;
            setSearchValue(value);
            handleSearch(value);
          }}
          placeholder="Buscar por nombre..."
          className="h-8.5 rounded-lg border-dashboard-border bg-white pl-9 text-[13px] font-normal shadow-none"
        />
      </div>

      {filterGroups.map((config) => {
        const activeValues = new Set(selectedFilters[config.key]);
        const activeFilterCount = activeValues.size;
        const normalizedOptionSearch = optionSearch.trim().toLowerCase();

        const visibleOptions =
          config.key === "tag" && normalizedOptionSearch
            ? config.options.filter((option) =>
                option.label.toLowerCase().includes(normalizedOptionSearch),
              )
            : config.options;

        return (
          <Popover
            key={config.key}
            open={openFilter === config.key}
            onOpenChange={(open) => {
              setOpenFilter(open ? config.key : null);

              if (!open) {
                setOptionSearch("");
              }
            }}
          >
            <PopoverTrigger
              className={cn(
                "flex h-8.5 items-center gap-2 rounded-lg border border-dashboard-border bg-white px-4 text-[13px] font-normal text-dashboard-text-muted shadow-none transition-colors hover:bg-dashboard-success-light hover:text-dashboard-success-text",
                activeFilterCount > 0 &&
                  "border-dashboard-success-light font-semibold bg-dashboard-success-light text-dashboard-success-text",
              )}
            >
              <span>{config.label}</span>

              {activeFilterCount > 0 && (
                <span className="text-xs font-semibold">
                  · {activeFilterCount}
                </span>
              )}

              <ChevronDown
                size={14}
                className={cn(
                  "text-dashboard-text-muted",
                  activeFilterCount > 0 && "text-dashboard-success-text",
                )}
              />
            </PopoverTrigger>

            <PopoverContent align="start" className="w-56 rounded-xl p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-dashboard-text-light">
                  Filtrar por {config.label.toLowerCase()}
                </p>
              </div>

              {config.key === "tag" && (
                <Input
                  type="search"
                  value={optionSearch}
                  onChange={(event) => setOptionSearch(event.target.value)}
                  placeholder="Buscar etiqueta..."
                  className="mb-3 h-8 rounded-lg border-dashboard-border bg-white text-sm"
                />
              )}

              <div className="mb-3 flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
                {visibleOptions.length === 0 ? (
                  <p className="text-xs text-dashboard-text-muted">
                    Sin opciones disponibles
                  </p>
                ) : (
                  visibleOptions.map((option) => {
                    const optionValue = option.id;
                    const isChecked = activeValues.has(optionValue);

                    return (
                      <label
                        key={optionValue}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(value) =>
                            updateFilterValue(
                              config.key,
                              optionValue,
                              Boolean(value),
                            )
                          }
                        />

                        {config.key === "tag" ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full border-transparent px-2 py-0.5 text-xs font-bold"
                            style={{
                              backgroundColor:
                                "color" in option &&
                                typeof option.color === "string"
                                  ? option.color
                                  : "#e5e7eb",
                            }}
                          >
                            {option.label}
                          </Badge>
                        ) : (
                          <span className="text-sm font-medium text-dashboard-text-muted">
                            {option.label}
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
              <div className="flex items-center justify-between border-t border-dashboard-border pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={activeFilterCount === 0}
                  className="h-7 px-1 text-xs font-semibold text-dashboard-text-muted hover:bg-transparent hover:text-dashboard-success-text"
                  onClick={() => clearFilter(config.key)}
                >
                  Limpiar
                </Button>

                <Button
                  type="button"
                  size="sm"
                  className="h-7 rounded-lg bg-dashboard-dark px-4 text-xs font-semibold text-white hover:bg-dashboard-dark/90"
                  onClick={() => setOpenFilter(null)}
                >
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </>
  );
}
