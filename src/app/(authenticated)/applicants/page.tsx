import 'server-only'
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
import z from 'zod';





export default async function ApplicantsPage(props: {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    role?: string[];
    jobOpening?: string[];
    seniority?: string[];
    tag?: string[];
    area?: string[];
  }>;
}) {
  const filterParamsSchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().default(1),
    role: z.array(z.string()).optional(),
    seniority: z.array(z.string()).optional(),
    jobOpening: z.array(z.string()).optional(),
    area: z.array(z.string()).optional(),
  });

  const searchParams = await props.searchParams;
  const params = filterParamsSchema.parse(searchParams);
  const data = api.applicant.fetchAll({
    search: params.search,
    currentPage: params.page,
    roleId: params.role ?? [],
    seniorityId: params.seniority ?? [],
    jobOpeningId: params.jobOpening ?? [],
    areaId: params.area ?? [],
  });
  
  const countApplicants = api.applicant.fetchAmount();
  const roleData = api.role.getAllRoles({});
  const seniorityData = api.seniority.getAllSeniorities({});
  const areaData = api.area.getAllAreas({});
  const jobOpeningData = api.jobOpening.getAllJobOpenings({});
  const tagData = api.tag.getAllTags({});

  return (
    <div className="flex-1 min-w-0 w-full max-w-full p-8 font-sans text-dashboard-text-primary overflow-x-hidden">
      <Suspense fallback={<HeaderFallback />}>
        <ApplicantAwaiterHeader promiseData={data}
          promiseCount={countApplicants} />
      </Suspense>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Suspense fallback={<FiltersFallback />}>
          <ApplicantAwaiterFilters
            promiseRoleData={roleData}
            promiseSeniorityData={seniorityData}
            promiseAreaData={areaData}
            promiseJobOpeningData={jobOpeningData}
            promiseTagData={tagData}
          />
        </Suspense>
      </div>
      <Suspense fallback={
        <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
          <Table className="min-w-262.5 table-fixed">
            <ApplicantTableHeader />
            <TableBody className="divide-y divide-dashboard-border">
              <TableFallback />
            </TableBody>
          </Table>
        </div>
      }>
        <ApplicantAwaiterTable promiseData={data} promiseCount={countApplicants} />
      </Suspense>
      {/*
      <Suspense fallback= {<PaginationFallback/>}>
        <ApplicantAwaiterPagination promiseData = { data }/>
      </Suspense>*/}
    </div>
  );
}