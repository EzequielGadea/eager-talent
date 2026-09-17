'use client';

import { ChevronDown, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { FilterKey, FiltersProps } from '../types';

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

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (term.trim()) {
      params.set('search', term.trim());
    } else {
      params.delete('search');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  const filterGroups = [
    {
      key: 'jobOpening' as const,
      label: 'Vacantes',
      options: jobOpeningData.map((item) => ({ id: item.id, label: item.name })),
    },
    {
      key: 'role' as const,
      label: 'Roles',
      options: roleData.map((item) => ({ id: item.id, label: item.name })),
    },
    {
      key: 'seniority' as const,
      label: 'Seniority',
      options: seniorityData.map((item) => ({ id: item.id, label: item.name })),
    },
    {
      key: 'area' as const,
      label: 'Área',
      options: areaData.map((item) => ({ id: item.id, label: item.name })),
    },
    {
      key: 'tag' as const,
      label: 'Etiquetas',
      options: tagData.map((item) => ({ id: item.id, label: item.name, color: item.color })),
    },
  ];

  const updateFilterValue = (key: FilterKey, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const selectedValues = new Set(params.getAll(key));

    if (checked) {
      selectedValues.add(value);
    } else {
      selectedValues.delete(value);
    }

    params.delete(key);
    params.set('page', '1');
    for (const item of selectedValues) {
      params.append(key, item);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilter = (key: FilterKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set('page', '1');

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
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Buscar por nombre..."
          className="h-8 rounded-lg border-dashboard-border bg-white pl-9 text-sm shadow-sm"
        />
      </div>

      {filterGroups.map((config) => {
        const activeValues = new Set(searchParams.getAll(config.key));
        const activeFilterCount = activeValues.size;

        return (
          <Popover key={config.key}>
            <PopoverTrigger className="flex h-8 items-center gap-1.5 rounded-lg border border-dashboard-border bg-white px-4 text-sm font-medium text-dashboard-text-muted shadow-sm transition-colors hover:bg-dashboard-success-light hover:text-dashboard-success-text">
              <span>{config.label}</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-dashboard-success-light px-1.5 text-xs text-dashboard-success-text">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={14} className="text-dashboard-text-muted" />
            </PopoverTrigger>

            <PopoverContent align="start" className="w-56 rounded-xl p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-dashboard-text-light">
                  Filtrar por {config.label.toLowerCase()}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={activeFilterCount === 0}
                  className="h-auto p-0 text-[10px] font-bold text-dashboard-text-muted hover:bg-transparent hover:text-dashboard-success-text"
                  onClick={() => clearFilter(config.key)}
                >
                  Limpiar
                </Button>
              </div>

              <div className="mb-3 flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
                {config.options.length === 0 ? (
                  <p className="text-xs text-dashboard-text-muted">Sin opciones disponibles</p>
                ) : (
                  config.options.map((option) => {
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
                            updateFilterValue(config.key, optionValue, Boolean(value))
                          }
                        />

                        {config.key === 'tag' ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full border-transparent px-2 py-0.5 text-xs font-bold"
                            style={{
                              backgroundColor: 'color' in option ? option.color ?? '#e5e7eb' : '#e5e7eb',
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
            </PopoverContent>
          </Popover>
        );
      })}
    </>
  );
}