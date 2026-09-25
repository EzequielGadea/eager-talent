import "server-only";

import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Table, TableBody } from "~/components/ui/table";
import { api } from "~/lib/trpc/server";
import { ApplicantTableHeader } from "./_components/applicant-table";
import {
  ApplicantAwaiterFilters,
  ApplicantAwaiterHeader,
  ApplicantAwaiterTable,
} from "./_components/applicant-awaiter";
import {
  FiltersFallback,
  HeaderFallback,
  TableFallback,
} from "./_components/fallbacks";
import type { ApplicantsSearchParams } from "./types";
import { Source } from "~/generated/prisma/enums";
import { auth } from "~/lib/auth";

const applicantsSearchParamsSchema = z.object({
  search: z.union([z.string(), z.array(z.string())]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  role: z.union([z.string(), z.array(z.string())]).optional(),
  jobOpening: z.union([z.string(), z.array(z.string())]).optional(),
  seniority: z.union([z.string(), z.array(z.string())]).optional(),
  tag: z.union([z.string(), z.array(z.string())]).optional(),
  area: z.union([z.string(), z.array(z.string())]).optional(),
  source: z.union([z.enum(Source), z.array(z.enum(Source))]).optional(),
});

function normalizeArrayParam<T extends string>(
  value: T | T[] | undefined,
): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function ApplicantsPage(props: {
  searchParams?: Promise<ApplicantsSearchParams>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-4 text-dashboard-text-primary">
          <HeaderFallback />
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FiltersFallback />
          </div>
          <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
            <Table className="min-w-262.5 table-fixed">
              <ApplicantTableHeader />
              <TableBody className="divide-y divide-dashboard-border">
                <TableFallback />
              </TableBody>
            </Table>
          </div>
        </div>
      }
    >
      <ProtectedApplicantsPage searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ProtectedApplicantsPage(props: {
  searchParams?: Promise<ApplicantsSearchParams>;
}) {
  const permission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        applicant: ["read"],
      },
    },
  });

  if (!permission.success) {
    redirect("/dashboard");
  }

  const searchParams = props.searchParams ?? Promise.resolve({});
  const normalized = searchParams.then((rawParams) => {
    const params = applicantsSearchParamsSchema.parse(rawParams);

    return {
      search: typeof params.search === "string" ? params.search : undefined,
      page: params.page,
      role: normalizeArrayParam(params.role),
      seniority: normalizeArrayParam(params.seniority),
      jobOpening: normalizeArrayParam(params.jobOpening),
      area: normalizeArrayParam(params.area),
      tag: normalizeArrayParam(params.tag),
      source: normalizeArrayParam(params.source),
    };
  });

  const data = normalized.then((params) =>
    api.applicant.fetchAll({
      search: params.search,
      page: params.page,
      roleId: params.role,
      seniorityId: params.seniority,
      jobOpeningId: params.jobOpening,
      areaId: params.area,
      tagId: params.tag,
      source: params.source,
    }),
  );

  const countApplicants = normalized.then((params) =>
    api.applicant.fetchAmount({
      search: params.search,
      roleId: params.role,
      seniorityId: params.seniority,
      jobOpeningId: params.jobOpening,
      areaId: params.area,
      tagId: params.tag,
      source: params.source,
    }),
  );

  const roleData = api.role.getAllRoles({});
  const seniorityData = api.seniority.getAllSeniorities({});
  const areaData = api.area.getAllAreas({});
  const jobOpeningData = api.jobOpening.getAllJobOpenings({});
  const tagData = api.tag.getAllTags({});

  return (
    <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-4 text-dashboard-text-primary">
      <Suspense fallback={<HeaderFallback />}>
        <ApplicantAwaiterHeader
          promiseCountApplicants={countApplicants}
          promiseCountOpenings={jobOpeningData}
        />
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
