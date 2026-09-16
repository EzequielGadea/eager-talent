import "server-only";
//import { FaLinkedin } from "react-icons/fa";
//sourceIcon: <Send size={14} className="text-dashboard-text-muted" />,
//sourceIcon: <Globe size={14} className="text-dashboard-text-muted" />,
//sourceIcon: <Users size={14} className="text-dashboard-text-muted" />,
//sourceIcon: <Briefcase size={14} className="text-dashboard-text-muted" />,
//sourceIcon: <>{/*<FaLinkedin size={14} className="text-[#0a66c2]" />*/}</>,

import { Table, TableBody } from "~/components/ui/table";
import { getApplicantsPage } from "./actions";
import { api } from "~/lib/trpc/server";
import { Suspense } from "react";
import {
  ApplicantAwaiterHeader,
  ApplicantAwaiterTable,
  ApplicantAwaiterFilters,
  ApplicantAwaiterPagination,
} from "./_components/applicant-awaiter";
import {
  FiltersFallback,
  HeaderFallback,
  TableFallback,
  PaginationFallback,
} from "./_components/fallbacks";
import { ApplicantTableHeader } from "./_components/applicant-table";

export default async function ApplicantsPage() {
  // llamado a obtener los candidatos
  const data = getApplicantsPage(1);
  const countApplicants = api.applicant.fetchAmount();

  return (
    <div className="flex-1 min-w-0 w-full max-w-full p-8 font-sans text-dashboard-text-primary overflow-x-hidden">
      <Suspense fallback={<HeaderFallback />}>
        <ApplicantAwaiterHeader
          promiseData={data}
          promiseCount={countApplicants}
        />
      </Suspense>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Suspense fallback={<FiltersFallback />}>
          <ApplicantAwaiterFilters promiseData={data} />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <>
            <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
              <Table className="min-w-262.5 table-fixed">
                <ApplicantTableHeader />
                <TableBody className="divide-y divide-dashboard-border">
                  <TableFallback />
                </TableBody>
              </Table>
            </div>
            <Suspense fallback={<PaginationFallback />}>
              <ApplicantAwaiterPagination
                promiseCount={countApplicants}
                currentPage={1}
              />
            </Suspense>
          </>
        }
      >
        <ApplicantAwaiterTable
          promiseData={data}
          promiseCount={countApplicants}
        />
      </Suspense>
    </div>
  );
}
