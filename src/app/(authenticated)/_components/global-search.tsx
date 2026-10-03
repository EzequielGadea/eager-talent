"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import type { JobOpeningStatus } from "~/generated/prisma/enums";
import { api } from "~/lib/trpc/react";
import { VacanciesIcon } from "./app-icons";

const jobOpeningStatusLabel: Record<JobOpeningStatus, string> = {
  Open: "Abierta",
  Paused: "Pausada",
  Closed: "Cerrada",
  Cancelled: "Cancelada",
};

const commandGroupClassName =
  "**:[[cmdk-group-heading]]:font-sans **:[[cmdk-group-heading]]:font-bold **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.06em]";
const resultItemClassName =
  "gap-3 rounded-lg px-3 py-2.5 data-selected:bg-success-bg";

type MetaPart = { text: string; color?: string; className?: string };

function MetaLine({ parts }: { parts: MetaPart[] }) {
  return (
    <span className="truncate text-xs text-text-secondary">
      {parts.map((part, index) => (
        <span
          key={index}
          style={part.color ? { color: part.color } : undefined}
          className={part.className}
        >
          {index > 0 && " · "}
          {part.text}
        </span>
      ))}
    </span>
  );
}

function ResultItem({
  value,
  onSelect,
  icon,
  title,
  meta,
}: {
  value: string;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  meta: MetaPart[];
}) {
  return (
    <CommandItem
      value={value}
      onSelect={onSelect}
      className={resultItemClassName}
    >
      {icon}

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-text-primary">
          {title}
        </span>
        <MetaLine parts={meta} />
      </div>
    </CommandItem>
  );
}

function KeyHint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <kbd className="rounded border border-border-default bg-white px-1 py-0.5 text-xs">
        {keys}
      </kbd>
      {label}
    </span>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedQuery] = useDebounce(query.trim(), 200);

  const { data, isLoading } = api.search.global.useQuery(
    { query: debouncedQuery },
    { enabled: isFocused && debouncedQuery.length > 0 },
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (document.activeElement === input) {
      setIsFocused(true);
    }

    if (input.value) {
      setQuery(input.value);
    }
  }, []);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function goToApplicant(id: string) {
    setQuery("");
    inputRef.current?.blur();
    router.push(`/applicants/${id}`);
  }

  function goToJobOpening(id: string) {
    setQuery("");
    inputRef.current?.blur();
    router.push(`/job-openings/${id}`);
  }

  const hasApplicants = (data?.applicants.length ?? 0) > 0;
  const hasJobOpenings = (data?.jobOpenings.length ?? 0) > 0;
  const normalizedQuery = query.trim();
  const isDebouncing = normalizedQuery !== debouncedQuery;
  const isSearchPending =
    normalizedQuery.length > 0 && (isDebouncing || (isLoading && !data));
  const showResults = isFocused && normalizedQuery.length > 0;

  return (
    <div className="relative flex w-[calc(50%-2rem)] items-center">
      <Command
        shouldFilter={false}
        className="contents"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            inputRef.current?.blur();
          }
        }}
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-text-tertiary"
          aria-hidden="true"
        />

        <CommandPrimitive.Input
          ref={inputRef}
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Buscar"
          placeholder="Buscar candidatos, vacantes o etiquetas…"
          className="h-9.5 w-full rounded-md border border-border-default bg-slate-50 py-2 pr-14 pl-9 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-focus"
        />

        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border-default bg-white px-1.5 py-0.5 text-xs text-text-tertiary">
          {isFocused ? "Esc" : "⌘K"}
        </kbd>

        {showResults && (
          <div
            onMouseDown={(event) => event.preventDefault()}
            className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-border-default bg-white shadow-lg"
          >
            <CommandList hideScrollbar={false} className="max-h-96">
              <CommandEmpty className="py-8 text-center text-sm text-text-tertiary">
                {isSearchPending
                  ? "Buscando…"
                  : `No se encontraron resultados para "${query}".`}
              </CommandEmpty>

              {!isDebouncing && hasApplicants && (
                <CommandGroup
                  heading="CANDIDATOS"
                  className={`px-2 pt-2 ${commandGroupClassName}`}
                >
                  {data?.applicants.map((applicant) => (
                    <ResultItem
                      key={applicant.id}
                      value={`applicant-${applicant.id}`}
                      onSelect={() => goToApplicant(applicant.id)}
                      title={applicant.name}
                      icon={
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tag-amber-bg text-xs font-semibold text-tag-amber-fg">
                          {applicant.initials}
                        </div>
                      }
                      meta={[
                        { text: applicant.role },
                        ...(applicant.seniority
                          ? [
                              {
                                text: applicant.seniority.name,
                                color: applicant.seniority.color,
                              },
                            ]
                          : []),
                        ...applicant.tags.map((tag) => ({
                          text: tag.name,
                          color: tag.color,
                        })),
                      ]}
                    />
                  ))}
                </CommandGroup>
              )}

              {!isDebouncing && hasJobOpenings && (
                <CommandGroup
                  heading="VACANTES"
                  className={`px-2 pb-2 ${commandGroupClassName}`}
                >
                  {data?.jobOpenings.map((jobOpening) => (
                    <ResultItem
                      key={jobOpening.id}
                      value={`job-opening-${jobOpening.id}`}
                      onSelect={() => goToJobOpening(jobOpening.id)}
                      title={jobOpening.name}
                      icon={
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tag-purple-bg text-tag-purple-fg">
                          <VacanciesIcon
                            className="size-4"
                            aria-hidden="true"
                          />
                        </div>
                      }
                      meta={[
                        { text: jobOpening.area },
                        { text: jobOpeningStatusLabel[jobOpening.status] },
                        {
                          text:
                            jobOpening.applicantsCount === 0
                              ? "Sin candidatos"
                              : `${jobOpening.applicantsCount} candidato${jobOpening.applicantsCount === 1 ? "" : "s"}`,
                        },
                      ]}
                    />
                  ))}
                </CommandGroup>
              )}
            </CommandList>

            <div className="flex items-center justify-between gap-3 border-t border-border-default bg-slate-50 px-3 py-2 text-xs text-text-tertiary">
              <span className="flex items-center gap-3">
                <KeyHint keys="↑↓" label="navegar" />
                <KeyHint keys="↵" label="abrir" />
              </span>

              <span>Click en un resultado abre el perfil / detalle</span>
            </div>
          </div>
        )}
      </Command>
    </div>
  );
}
