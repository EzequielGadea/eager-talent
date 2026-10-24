"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiringManagerJobOpeningsFallback } from "./hiring-manager-job-openings-fallback";
import { RecruiterJobOpeningsFallback } from "./recruiter-job-openings-fallback";
import { api } from "~/lib/trpc/react";
import AssignedInterviews from "./assigned-interviews";
import {
  JobOpeningFilters,
  type JobOpeningFiltersValue,
} from "./job-opening-filters";
import { JobOpeningSort } from "./job-opening-sort";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import JobOpeningRow from "./job-opening-row";
import { JobOpeningCardList } from "./job-opening-card-list";
import { JobOpeningPagination } from "./job-opening-pagination";
import type { JobOpeningSortValue } from "~/server/api/routers/job-opening/sort";
import type { JobOpeningStatus } from "~/generated/prisma/enums";

export default function JobOpeningsList({
  currentPage,
  currentSort,
  currentStatuses,
  currentAreaId,
  currentHiringManagerId,
  currentOpeningDateRange,
  currentOnlyWithActiveCandidates,
  isHiringManagerView,
}: {
  currentPage: number;
  currentSort: JobOpeningSortValue;
  currentStatuses: JobOpeningStatus[];
  currentAreaId?: string;
  currentHiringManagerId?: string;
  currentOpeningDateRange?: JobOpeningFiltersValue["openingDateRange"];
  currentOnlyWithActiveCandidates: boolean;
  isHiringManagerView: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: jobOpenings,
    isLoading: isLoadingJobOpenings,
    isError: isErrorJobOpenings,
  } = api.jobOpening.getAllJobOpeningsDetailed.useQuery({
    page: currentPage,
    sort: currentSort,
    statuses: currentStatuses,
    areaId: currentAreaId,
    hiringManagerId: currentHiringManagerId,
    openingDateRange: currentOpeningDateRange,
    onlyWithActiveCandidates: currentOnlyWithActiveCandidates,
  });

  const {
    data: jobOpeningsAmount,
    isLoading: isLoadingAmount,
    isError: isErrorAmount,
  } = api.jobOpening.getJobOpeningsAmount.useQuery({
    statuses: currentStatuses,
    areaId: currentAreaId,
    hiringManagerId: currentHiringManagerId,
    openingDateRange: currentOpeningDateRange,
    onlyWithActiveCandidates: currentOnlyWithActiveCandidates,
  });

  const searchParams = useSearchParams();

  function updatePage(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  function updateSort(sort: JobOpeningSortValue) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", sort);
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  function updateFilters(filters: JobOpeningFiltersValue) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("status");
    filters.statuses.forEach((status) => params.append("status", status));

    if (filters.areaId) {
      params.set("area", filters.areaId);
    } else {
      params.delete("area");
    }

    if (filters.hiringManagerId) {
      params.set("hiringManager", filters.hiringManagerId);
    } else {
      params.delete("hiringManager");
    }

    if (filters.openingDateRange) {
      params.set("openingDate", filters.openingDateRange);
    } else {
      params.delete("openingDate");
    }

    if (filters.onlyWithActiveCandidates) {
      params.set("withActiveCandidates", "true");
    } else {
      params.delete("withActiveCandidates");
    }

    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  if (isLoadingJobOpenings || isLoadingAmount) {
    return isHiringManagerView ? (
      <HiringManagerJobOpeningsFallback />
    ) : (
      <RecruiterJobOpeningsFallback />
    );
  }

  if (
    isErrorJobOpenings ||
    isErrorAmount ||
    !jobOpenings ||
    !jobOpeningsAmount
  ) {
    return (
      <div className="text-danger md:p-6">
        No se pudieron cargar las vacantes.
      </div>
    );
  }

  const emptyMessage =
    currentStatuses.length > 0 ||
    currentAreaId ||
    currentHiringManagerId ||
    currentOpeningDateRange ||
    currentOnlyWithActiveCandidates
      ? "No hay vacantes que cumplan con los criterios del filtro."
      : "Todavía no hay vacantes registradas.";

  return (
    <div className="mx-auto flex w-full flex-col gap-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
            {isHiringManagerView ? "Mis vacantes" : "Vacantes"}
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {jobOpeningsAmount.open} activas · {jobOpeningsAmount.paused}{" "}
            pausadas · {jobOpeningsAmount.closed} cerradas ·{" "}
            {jobOpeningsAmount.cancelled} canceladas
          </p>
        </div>

        {!isHiringManagerView && (
          <div className="flex flex-wrap items-center gap-2">
            <JobOpeningFilters
              value={{
                statuses: currentStatuses,
                areaId: currentAreaId,
                hiringManagerId: currentHiringManagerId,
                openingDateRange: currentOpeningDateRange,
                onlyWithActiveCandidates: currentOnlyWithActiveCandidates,
              }}
              onValueChange={updateFilters}
            />
            <JobOpeningSort value={currentSort} onValueChange={updateSort} />

            <Button
              size="sm"
              className="h-8.5 w-8.5 gap-2 rounded-full bg-dashboard-dark px-0 text-text-on-dark hover:bg-dashboard-dark-hover md:h-7 md:w-auto md:px-2.5"
              onClick={() => router.push("/job-openings/new-job-opening")}
            >
              <Plus size={16} />
              {/* Icon-only on mobile; the label stays available to screen readers. */}
              <span className="sr-only md:not-sr-only">Nueva vacante</span>
            </Button>
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-white shadow-sm">
        <JobOpeningCardList
          jobOpenings={jobOpenings}
          isHiringManagerView={isHiringManagerView}
          emptyMessage={emptyMessage}
        />

        <div className="hidden w-full overflow-x-auto md:block">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="h-9.75 border-b border-dashboard-border bg-(--surface-subtle) hover:bg-(--surface-subtle)">
                <TableHead className="h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  Vacante
                </TableHead>

                <TableHead className="h-9.75 w-[14rem] min-w-[14rem] px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  Área
                </TableHead>

                {!isHiringManagerView && (
                  <TableHead className="h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                    Hiring Managers
                  </TableHead>
                )}

                <TableHead className="h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  Estado
                </TableHead>

                <TableHead className="h-9.75 w-[9.5rem] min-w-[9.5rem] whitespace-nowrap px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  Candidatos
                </TableHead>

                {isHiringManagerView && (
                  <>
                    <TableHead className="h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                      Entrevista técnica
                    </TableHead>

                    <TableHead className="h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                      Ofertados
                    </TableHead>
                  </>
                )}

                <TableHead className="h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  Abierta hace
                </TableHead>

                <TableHead className="h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground" />
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-dashboard-border">
              {jobOpenings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isHiringManagerView ? 8 : 7}
                    className="h-24 text-center text-dashboard-text-muted"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                jobOpenings.map((jobOpening) => (
                  <JobOpeningRow
                    key={jobOpening.id}
                    jobOpening={jobOpening}
                    isHiringManagerView={isHiringManagerView}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <JobOpeningPagination
          countJobOpenings={jobOpeningsAmount.total}
          currentPage={currentPage}
          onPageChange={updatePage}
        />
      </div>

      {isHiringManagerView && <AssignedInterviews />}
    </div>
  );
}
