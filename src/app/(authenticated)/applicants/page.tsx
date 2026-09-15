import 'server-only'
import {
  Search,
  ChevronDown,
  FileText,
  Globe,
  Send,
  Users,
  Briefcase,
} from "lucide-react";
//import { FaLinkedin } from "react-icons/fa";
//sourceIcon: <Send size={14} className="text-dashboard-text-muted" />,
//sourceIcon: <Globe size={14} className="text-dashboard-text-muted" />,
//sourceIcon: <Users size={14} className="text-dashboard-text-muted" />, 
//sourceIcon: <Briefcase size={14} className="text-dashboard-text-muted" />,  
//sourceIcon: <>{/*<FaLinkedin size={14} className="text-[#0a66c2]" />*/}</>,

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



export default async function CandidatosPage() {

  // llamado a obtener los candidatos
  const data = api.applicant.fetchAll();


  return (
    <div className="flex-1 min-w-0 w-full max-w-full p-8 font-sans text-dashboard-text-primary overflow-x-hidden">
      <Suspense fallback= {<HeaderFallback/>}>
        <ApplicantAwaiterHeader promise = { data }/>
      </Suspense>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Suspense fallback = {<FiltersFallback/>}>
          <ApplicantAwaiterFilters promise = { data }/>
        </Suspense>
      </div>
      <Suspense fallback= {<TableFallback/>}>
        <ApplicantAwaiterTable promise = { data }/>
      </Suspense>
      
      <Suspense fallback= {<PaginationFallback/>}>
        <ApplicantAwaiterPagination promise = { data }/>
      </Suspense>
    </div>
  );
}