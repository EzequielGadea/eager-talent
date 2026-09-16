import 'server-only'
import {
  Search,
  ChevronDown,
  FileText,
  Globe,
  Send,
  Users,
  Briefcase,
  X,
} from "lucide-react";
//import { FaLinkedin } from "react-icons/fa";
//sourceIcon: <Send size={14} className="text-dashboard-text-muted" />,
//sourceIcon: <Globe size={14} className="text-dashboard-text-muted" />,
//sourceIcon: <Users size={14} className="text-dashboard-text-muted" />, 
//sourceIcon: <Briefcase size={14} className="text-dashboard-text-muted" />,  
//sourceIcon: <>{/*<FaLinkedin size={14} className="text-[#0a66c2]" />*/}</>,

import { Table, TableBody } from "~/components/ui/table";

import { api } from "~/lib/trpc/server";
import { Filters } from "./_components/filters";
import { Suspense } from "react";
import { 
  ApplicantAwaiterHeader, 
  ApplicantAwaiterPagination, 
  ApplicantAwaiterTable,
  ApplicantAwaiterFilters,
} from './_components/applicant-awaiter';
import { 
  FiltersFallback,
  HeaderFallback, 
  TableFallback,
  PaginationFallback,
} from './_components/fallbacks';
import { ApplicantTableHeader } from './_components/applicant-table';

export function getSourceIcon(sourceText : string) {
  switch(sourceText) {
    case "Inbound": return (<Globe size={14} className="text-dashboard-text-muted" />);
    case "Outbound": return (<Send size={14} className="text-dashboard-text-muted" />);
    case "Referral": return (<Users size={14} className="text-dashboard-text-muted"/>);
    default: return (<X size={14} className="text-dashboard-text-muted"/>)
  }
}

export function getApplicantsPage(page:number) {
  return api.applicant.fetchAll();
}

export default async function ApplicantsPage() {

  // llamado a obtener los candidatos
  const data = getApplicantsPage(1)
  const countApplicants = api.applicant.fetchAmount()

  return (
    <div className="flex-1 min-w-0 w-full max-w-full p-8 font-sans text-dashboard-text-primary overflow-x-hidden">
      <Suspense fallback= {<HeaderFallback/>}>
        <ApplicantAwaiterHeader promiseData = { data } promiseCount={ countApplicants}/>
      </Suspense>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Suspense fallback = {<FiltersFallback/>}>
          <ApplicantAwaiterFilters promiseData = { data }/>
        </Suspense>
      </div>
      <Suspense fallback= {
        <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
          <Table className="min-w-262.5 table-fixed">
            <ApplicantTableHeader/>
            <TableBody className="divide-y divide-dashboard-border">
              <TableFallback/>
            </TableBody>
          </Table>
        </div>
      }>
        <ApplicantAwaiterTable promiseData = { data } promiseCount = {countApplicants}/>
      </Suspense>
      {/*
      <Suspense fallback= {<PaginationFallback/>}>
        <ApplicantAwaiterPagination promiseData = { data }/>
      </Suspense>*/}
    </div>
  );
}