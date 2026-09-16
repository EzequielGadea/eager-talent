'use client'
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
import { transformApplicants } from "../utils";
import { ApplicantRow } from "./applicant-row";
import { ITEMS_PER_PAGE } from "../constants";
import { getApplicantsPage } from "../utils";
import { TableFallback } from "./fallbacks";

export function ApplicantTable(props : {applicantsData : ApplicantInfo[], countApplicants : number}) {
  const [applicantsData, setApplicants] = useState(props.applicantsData)
    const [currentPage, setCurrentPage] = useState(1);
    const paginatedApplicants = props.applicantsData?.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
      <div className="flex min-h-screen flex-col">  
        <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
          <Table className="min-w-262.5 table-fixed">
          <ApplicantTableHeader/>

            <TableBody className="divide-y divide-dashboard-border">
              { isLoading
              ? <TableFallback/>
              :applicantsData?.map((applicant) => (
                <ApplicantRow key={applicant.id} applicant={applicant} />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-auto">
          <ApplicantPagination
            countApplicants={props.countApplicants}
            currentPage={currentPage}
            onPageChange={updateRow}
          />
        </div>
      </div>
    )
}

export function ApplicantTableHeader(){
  return (
    <TableHeader>
      <TableRow className="border-b border-dashboard-border hover:bg-transparent">
        <TableHead className="w-35 h-10 px-3 py-4 pl-5 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          Candidato
        </TableHead>
        <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          Etiquetas
        </TableHead>
        <TableHead className="w-30 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          Vacante
        </TableHead>
        <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          Rol
        </TableHead>
        <TableHead className="w-14 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          Seniority
        </TableHead>
        <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          Área
        </TableHead>
        <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          Source
        </TableHead>
        <TableHead className="w-6 h-10 px-3 py-4 text-center text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          CV
        </TableHead>
        <TableHead className="w-15 h-10 px-3 py-4 text-center text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          LinkedIn
        </TableHead>
        <TableHead className="w-30 h-10 px-3 py-4 pr-5 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
          Correo
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}