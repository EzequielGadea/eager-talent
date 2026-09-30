"use client";

import { useDeferredValue, useState } from "react";

import { Loader2, Search, UserRound } from "lucide-react";

import { api } from "~/lib/trpc/react";

import { Input } from "~/components/ui/input";

import type { AvailableApplicant } from "./add-applicant-types";
import { AvailableApplicantItem } from "./available-applicant-item";

type AddApplicantSelectionProps = {
  jobOpeningId: string;
  onSelect: (applicant: AvailableApplicant) => void;
};

export function AddApplicantSelection({
  jobOpeningId,
  onSelect,
}: AddApplicantSelectionProps) {
  const [search, setSearch] = useState("");
  const [additionalApplicants, setAdditionalApplicants] = useState<
    AvailableApplicant[]
  >([]);
  const [loadedOffset, setLoadedOffset] = useState<number | null>(null);
  const [loadedHasMore, setLoadedHasMore] = useState<boolean | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const deferredSearch = useDeferredValue(search.trim());

  const utils = api.useUtils();

  const applicantsQuery = api.application.fetchAvailableApplicants.useQuery({
    jobOpeningId,
    search: deferredSearch || undefined,
    limit: 10,
    offset: 0,
  });

  const isSearchUpdating = search.trim() !== deferredSearch;

  const applicants = isSearchUpdating
    ? []
    : [...(applicantsQuery.data?.applicants ?? []), ...additionalApplicants];

  const hasMore = isSearchUpdating
    ? false
    : (loadedHasMore ?? applicantsQuery.data?.hasMore ?? false);

  async function handleLoadMore() {
    if (loadingMore || !hasMore) {
      return;
    }

    const offset = loadedOffset ?? applicantsQuery.data?.nextOffset ?? 0;

    setLoadingMore(true);

    try {
      const result = await utils.application.fetchAvailableApplicants.fetch({
        jobOpeningId,
        search: deferredSearch || undefined,
        limit: 10,
        offset,
      });

      setAdditionalApplicants((current) => [...current, ...result.applicants]);

      setLoadedOffset(result.nextOffset);
      setLoadedHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setAdditionalApplicants([]);
    setLoadedOffset(null);
    setLoadedHasMore(null);
  }

  const initialLoading = applicantsQuery.isLoading || isSearchUpdating;

  return (
    <div className="flex flex-col">
      <div className="border-b border-border-default px-6 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />

          <Input
            type="text"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Buscar por nombre o email"
            className="h-10 pl-9"
          />
        </div>
      </div>

      <div
        className="max-h-[420px] overflow-y-auto px-3 py-2"
        onScroll={(event) => {
          const element = event.currentTarget;
          const distanceToBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight;

          if (distanceToBottom < 120) {
            void handleLoadMore();
          }
        }}
      >
        {initialLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-text-secondary" />
          </div>
        ) : applicantsQuery.isError ? (
          <div className="flex min-h-48 items-center justify-center px-6 text-center text-sm text-danger">
            No se pudieron cargar los candidatos.
          </div>
        ) : applicants.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
            <UserRound className="mb-3 size-8 text-text-tertiary" />

            <p className="text-sm font-medium text-text-primary">
              No hay candidatos disponibles
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              {search.trim()
                ? "Probá con otro nombre o email."
                : "Todos los candidatos disponibles ya están aplicados a esta vacante."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {applicants.map((applicant) => (
              <AvailableApplicantItem
                key={applicant.id}
                applicant={applicant}
                onSelect={onSelect}
              />
            ))}

            {(hasMore || loadingMore) && (
              <div className="flex min-h-12 items-center justify-center">
                {loadingMore && (
                  <Loader2 className="size-4 animate-spin text-text-secondary" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
