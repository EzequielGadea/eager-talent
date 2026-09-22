"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { ApplicantPagination } from "./applicant-pagination";
import { ApplicantInfo } from "../types";
import { ApplicantRow } from "./applicant-row";

export function ApplicantTable(props: {
  applicantsData: ApplicantInfo[];
  countApplicants: number;
  currentPage: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updatePage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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

  return (
    <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-262.5 table-fixed">
          <ApplicantTableHeader />

          <TableBody className="divide-y divide-dashboard-border">
            {props.applicantsData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-dashboard-text-muted"
                >
                  {hasActiveFilters
                    ? "No se encontraron candidatos con los filtros aplicados."
                    : "Todavía no hay candidatos registrados."}
                </TableCell>
              </TableRow>
            ) : (
              props.applicantsData.map((applicant) => (
                <ApplicantRow key={applicant.id} applicant={applicant} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ApplicantPagination
        countApplicants={props.countApplicants}
        currentPage={props.currentPage}
        onPageChange={updatePage}
      />
    </div>
  );
}

export function ApplicantTableHeader() {
  return (
    <TableHeader>
      <TableRow className="h-9.75 border-b border-dashboard-border bg-(--surface-subtle) hover:bg-(--surface-subtle)">
        <TableHead className="h-9.75 w-35 pl-10 pr-4 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
          Candidato
        </TableHead>
        <TableHead className="w-32 h-9.75 pl-10 pr-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
          Etiquetas
        </TableHead>
        <TableHead className="w-30 h-9.75 pl-8 pr-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
          Vacante
        </TableHead>
        <TableHead className="w-28 h-9.75 pl-12 pr-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
          Rol
        </TableHead>
        <TableHead className="w-20 h-9.75 px-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
          Seniority
        </TableHead>
        <TableHead className="w-24 h-9.75 pl-10 pr-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
          Área
        </TableHead>
        <TableHead className="w-24 h-9.75 pl-7 pr-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
          Source
        </TableHead>
        <TableHead className="w-8 h-9.75 px-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          CV
        </TableHead>
        <TableHead className="w-15 h-9.75 px-3 py-0 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          LinkedIn
        </TableHead>
        <TableHead className="w-36 h-9.75 px-3 py-0 pr-4 pl-10 text-xs font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
          Correo
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
