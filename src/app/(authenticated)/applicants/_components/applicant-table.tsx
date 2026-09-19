"use client";

import { useState } from "react";

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
import { TableFallback } from "./fallbacks";
import { transformApplicants } from "../utils";
import { getApplicantsPage } from "../actions";

export function ApplicantTable(props: {
  applicantsData: ApplicantInfo[];
  countApplicants: number;
}) {
  const [applicantsData, setApplicants] = useState(props.applicantsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  async function updateRow(page: number) {
    setIsLoading(true);

    try {
      const raw = getApplicantsPage(page);
      const { applicantsData: newApplicants } = await transformApplicants(raw);

      setCurrentPage(page);
      setApplicants(newApplicants);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-white shadow-sm">
        <Table className="w-full table-auto">
          <ApplicantTableHeader />

          <TableBody className="divide-y divide-dashboard-border">
            {isLoading ? (
              <TableFallback />
            ) : applicantsData?.length > 0 ? (
              applicantsData.map((applicant) => (
                <ApplicantRow key={applicant.id} applicant={applicant} />
              ))
            ) : (
              <TableRow className="border-b border-dashboard-border hover:bg-transparent">
                <TableCell
                  colSpan={10}
                  className="h-20 px-3 py-4 text-center text-sm font-medium text-dashboard-text-muted"
                >
                  No se encontraron candidatos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <ApplicantPagination
          countApplicants={props.countApplicants}
          currentPage={currentPage}
          onPageChange={updateRow}
        />
      </div>
    </div>
  );
}

export function ApplicantTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-b border-dashboard-border hover:bg-transparent">
        <TableHead className="px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          Candidato
        </TableHead>

        <TableHead className="px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          Etiquetas
        </TableHead>

        <TableHead className="px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          Vacante
        </TableHead>

        <TableHead className="px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          Rol
        </TableHead>

        <TableHead className="px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          Seniority
        </TableHead>

        <TableHead className="px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          Área
        </TableHead>

        <TableHead className="px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          Fuente
        </TableHead>

        <TableHead className="w-px whitespace-nowrap px-2 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          CV
        </TableHead>

        <TableHead className="w-px whitespace-nowrap px-2 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          in
        </TableHead>

        <TableHead className="px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.04em] text-dashboard-text-light">
          Correo
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
