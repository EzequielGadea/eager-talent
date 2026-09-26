"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import JobOpeningsFallback from "./job-openings-fallback";
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
import { JobOpeningPagination } from "./job-opening-pagination";
import type { JobOpeningSortValue } from "~/server/api/routers/job-opening/sort";
import type { JobOpeningStatus } from "~/generated/prisma/enums";

export default function JobOpeningsList({
  currentPage,
  currentSort,
  currentStatuses,
  currentAreaId,
  currentHiringManagerId,
  isHiringManagerView,
}: {
  currentPage: number;
  currentSort: JobOpeningSortValue;
  currentStatuses: JobOpeningStatus[];
  currentAreaId?: string;
  currentHiringManagerId?: string;
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
  });

  const {
    data: jobOpeningsAmount,
    isLoading: isLoadingAmount,
    isError: isErrorAmount,
  } = api.jobOpening.getJobOpeningsAmount.useQuery({
    statuses: currentStatuses,
    areaId: currentAreaId,
    hiringManagerId: currentHiringManagerId,
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

    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  if (isLoadingJobOpenings || isLoadingAmount) {
    return <JobOpeningsFallback />;
  }

  if (
    isErrorJobOpenings ||
    isErrorAmount ||
    !jobOpenings ||
    !jobOpeningsAmount
  ) {
    return (
      <div className="p-6 text-danger">No se pudieron cargar las vacantes.</div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {isHiringManagerView ? "Mis vacantes" : "Vacantes"}
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {jobOpeningsAmount.open} activas · {jobOpeningsAmount.paused}{" "}
            pausadas · {jobOpeningsAmount.closed} cerradas ·{" "}
            {jobOpeningsAmount.cancelled} canceladas
          </p>
        </div>

        {!isHiringManagerView && (
          <div className="flex items-center gap-2">
            <JobOpeningFilters
              value={{
                statuses: currentStatuses,
                areaId: currentAreaId,
                hiringManagerId: currentHiringManagerId,
              }}
              onValueChange={updateFilters}
            />
            <JobOpeningSort value={currentSort} onValueChange={updateSort} />

            <Button
              size="sm"
              className="gap-2 rounded-full bg-dashboard-dark text-text-on-dark hover:bg-dashboard-dark-hover"
              onClick={() => router.push("/job-openings/new")}
            >
              <Plus size={16} />
              Nueva vacante
            </Button>
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="border-b border-dashboard-border bg-(--surface-subtle) hover:bg-(--surface-subtle)">
                <TableHead className="px-4 py-3">Vacante</TableHead>

                <TableHead className="px-4 py-3">Área</TableHead>

                {!isHiringManagerView && (
                  <TableHead className="px-4 py-3">Hiring Managers</TableHead>
                )}

                <TableHead className="px-4 py-3">Estado</TableHead>

                <TableHead className="px-4 py-3">Candidatos</TableHead>

                {isHiringManagerView && (
                  <>
                    <TableHead className="px-4 py-3">
                      Entrevista técnica
                    </TableHead>

                    <TableHead className="px-4 py-3">Ofertados</TableHead>
                  </>
                )}

                <TableHead className="px-4 py-3">Abierta hace</TableHead>

                <TableHead className="px-4 py-3" />
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-dashboard-border">
              {jobOpenings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isHiringManagerView ? 8 : 7}
                    className="h-24 text-center text-dashboard-text-muted"
                  >
                    {currentStatuses.length > 0 ||
                    currentAreaId ||
                    currentHiringManagerId
                      ? "No hay vacantes que cumplan con los criterios del filtro."
                      : "Todavía no hay vacantes registradas."}
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
