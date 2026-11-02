"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { useDebouncedCallback } from "use-debounce";

import { Input } from "~/components/ui/input";

export function JobOpeningFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams?.get("search") ?? "";
  const [value, setValue] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setValue(currentSearch);
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, 300);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-tertiary" />

        <Input
          type="text"
          placeholder="Buscar"
          className="h-8 w-48 bg-surface-card rounded-lg pl-8 pr-2.5 text-sm"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleSearch(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
