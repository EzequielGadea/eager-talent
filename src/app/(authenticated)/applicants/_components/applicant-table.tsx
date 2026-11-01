"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ListPagination } from "~/components/list-pagination";

import { ApplicantCardList } from "./applicant-card-list";
import { ApplicantRow } from "./applicant-row";
import { HiringManagerApplicantRow } from "./hiring-manager-applicant-row";
import { TableFallback } from "./fallbacks";

import type { ApplicantInfo } from "../types";
import { columns, ITEMS_PER_PAGE } from "../constants";

export function ApplicantTable(props: {
  applicantsData: ApplicantInfo[];
  countApplicants: number;
  currentPage: number;
  isHiringManagerView: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updatePage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  const hasActiveFilters = [
    "search",
    "role",
    "jobOpening",
    "seniority",
    "area",
    "tag",
    "source",
  ].some((key) => searchParams.has(key));

  const emptyMessage = hasActiveFilters
    ? "No se encontraron candidatos con los filtros aplicados."
    : "Todavía no hay candidatos registrados.";

  return (
    <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-white shadow-sm">
      <ApplicantCardList
        applicants={props.applicantsData}
        isPending={isPending}
        emptyMessage={emptyMessage}
        isHiringManagerView={props.isHiringManagerView}
      />

      <div className="hidden w-full overflow-x-auto md:block">
        <Table
          className={
            props.isHiringManagerView
              ? "min-w-200 table-fixed"
              : "min-w-262.5 table-fixed"
          }
        >
          {props.isHiringManagerView ? (
            <HiringManagerApplicantTableHeader showSharedBy={false} />
          ) : (
            <ApplicantTableHeader />
          )}

          <TableBody className="divide-y divide-dashboard-border">
            {isPending ? (
              <TableFallback isHiringManagerView={props.isHiringManagerView} />
            ) : props.applicantsData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={props.isHiringManagerView ? 5 : 10}
                  className="h-24 text-center text-dashboard-text-muted"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : props.isHiringManagerView ? (
              props.applicantsData.map((applicant) => (
                <HiringManagerApplicantRow
                  key={applicant.id}
                  applicant={applicant}
                  showSharedBy={false}
                />
              ))
            ) : (
              props.applicantsData.map((applicant) => (
                <ApplicantRow key={applicant.id} applicant={applicant} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ListPagination
        totalItems={props.countApplicants}
        pageSize={ITEMS_PER_PAGE}
        currentPage={props.currentPage}
        itemLabel="candidatos"
        onPageChange={updatePage}
      />
    </div>
  );
}

export function HiringManagerApplicantTableHeader({
  showSharedBy,
}: {
  showSharedBy: boolean;
}) {
  return (
    <TableHeader>
      <TableRow className="h-9.75 border-b border-dashboard-border bg-(--surface-subtle) hover:bg-(--surface-subtle)">
        <TableHead
          className={`${showSharedBy ? "w-[30%]" : "w-[35%]"} h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Candidato
        </TableHead>

        <TableHead
          className={`${showSharedBy ? "w-[25%]" : "w-[35%]"} h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Vacante
        </TableHead>

        <TableHead
          className={`${showSharedBy ? "w-[25%]" : "w-[30%]"} h-9.75 px-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Etapa / Estado
        </TableHead>

        {showSharedBy && (
          <TableHead className="h-9.75 w-[20%] pr-4 py-0 pl-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Enviado por
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}

export function ApplicantTableHeader() {
  return (
    <TableHeader>
      <TableRow className="h-9.75 border-b border-dashboard-border bg-(--surface-subtle) hover:bg-(--surface-subtle)">
        <TableHead
          className={`h-9.75 ${columns.applicant} py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Candidato
        </TableHead>

        <TableHead
          className={`${columns.tags} h-9.75 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Etiquetas
        </TableHead>

        <TableHead
          className={`${columns.vacancy} h-9.75 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Vacante
        </TableHead>

        <TableHead
          className={`${columns.role} h-9.75 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Rol
        </TableHead>

        <TableHead
          className={`${columns.seniority} h-9.75 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Seniority
        </TableHead>

        <TableHead
          className={`${columns.area} h-9.75 pr-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Área
        </TableHead>

        <TableHead
          className={`${columns.source} h-9.75 pr-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Source
        </TableHead>

        <TableHead
          className={`${columns.cv} h-9.75 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          CV
        </TableHead>

        <TableHead
          className={`${columns.linkedin} h-9.75 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          LinkedIn
        </TableHead>

        <TableHead
          className={`${columns.email} h-9.75 py-0 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground`}
        >
          Correo
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
