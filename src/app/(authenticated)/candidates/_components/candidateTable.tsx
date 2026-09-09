import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";


import { CandidateInfo } from "../types";
import { CandidateRow } from "./candidateRow";

export function CandidateTable(props : {candidatesData : CandidateInfo[]}) {
    
    return (
      <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
        <Table className="min-w-262.5 table-fixed">
          <TableHeader>
            <TableRow className="border-b border-dashboard-border hover:bg-transparent">
              <TableHead className="w-30 h-10 px-3 py-4 pl-5 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
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
              <TableHead className="w-15 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Seniority
              </TableHead>
              <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Área
              </TableHead>
              <TableHead className="w-20 h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
                Source
              </TableHead>
              <TableHead className="w-7 h-10 px-3 py-4 text-center text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light text-center">
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

          <TableBody className="divide-y divide-dashboard-border">
            { props.candidatesData?.map((c) => ( 
                <CandidateRow 
                  key={c.id}
                  candidate = { c }
                />
            ))}
          </TableBody>
        </Table>
      </div>
    )
}