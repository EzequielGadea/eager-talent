import 'server-only';

import { Suspense } from 'react';
import { z } from 'zod';
import { Table, TableBody } from '~/components/ui/table';
import { api } from '~/lib/trpc/server';
import { ApplicantTableHeader } from './_components/applicant-table';
import {
  ApplicantAwaiterFilters,
  ApplicantAwaiterHeader,
  ApplicantAwaiterTable,
} from './_components/applicant-awaiter';
import { FiltersFallback, HeaderFallback, TableFallback } from './_components/fallbacks';
import type { ApplicantsSearchParams } from './types';

const applicantsSearchParamsSchema = z.object({
  search: z.union([z.string(), z.array(z.string())]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  role: z.union([z.string(), z.array(z.string())]).optional(),
  jobOpening: z.union([z.string(), z.array(z.string())]).optional(),
  seniority: z.union([z.string(), z.array(z.string())]).optional(),
  tag: z.union([z.string(), z.array(z.string())]).optional(),
  area: z.union([z.string(), z.array(z.string())]).optional(),
});

function normalizeArrayParam(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export default function ApplicantsPage(props: {
  searchParams?: Promise<ApplicantsSearchParams>;
}) {
  const searchParams = props.searchParams ?? Promise.resolve({});
  const normalized = searchParams.then((rawParams) => {
    const params = applicantsSearchParamsSchema.parse(rawParams);

    return {
      search: typeof params.search === 'string' ? params.search : undefined,
      page: params.page,
      role: normalizeArrayParam(params.role),
      seniority: normalizeArrayParam(params.seniority),
      jobOpening: normalizeArrayParam(params.jobOpening),
      area: normalizeArrayParam(params.area),
      tag: normalizeArrayParam(params.tag),
    };
  });

  const data = normalized.then((params) => api.applicant.fetchAll({
    search: params.search,
    page: params.page,
    roleId: params.role,
    seniorityId: params.seniority,
    jobOpeningId: params.jobOpening,
    areaId: params.area,
    tagId: params.tag,
  }));

  const countApplicants = normalized.then((params) => api.applicant.fetchAmount({
    search: params.search,
    roleId: params.role,
    seniorityId: params.seniority,
    jobOpeningId: params.jobOpening,
    areaId: params.area,
    tagId: params.tag,
  }));

  const roleData = api.role.getAllRoles({});
  const seniorityData = api.seniority.getAllSeniorities({});
  const areaData = api.area.getAllAreas({});
  const jobOpeningData = api.jobOpening.getAllJobOpenings({});
  const tagData = api.tag.getAllTags({});

  return (
    <div className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden p-8 font-sans text-dashboard-text-primary">
      <Suspense fallback={<HeaderFallback />}>
        <ApplicantAwaiterHeader promiseData={data} promiseCount={countApplicants} />
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

      <Suspense
        fallback={
          <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
            <Table className="min-w-262.5 table-fixed">
              <ApplicantTableHeader />
              <TableBody className="divide-y divide-dashboard-border">
                <TableFallback />
              </TableBody>
            </Table>
          </div>
        }
      >
        <ApplicantAwaiterTable
          promiseData={data}
          promiseCount={countApplicants}
          currentPage={normalized.then((params) => params.page)}
        />
      </Suspense>
    </div>
  );
}
