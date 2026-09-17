import 'server-only';

import { transformApplicants } from '../utils';
import { ApplicantsPromise } from '../types';
import { ApplicantTable } from './applicant-table';
import { Header } from './header';
import { Filters } from './filters';
import { api } from '~/lib/trpc/server';

async function awaitData(promise: ApplicantsPromise) {
  return transformApplicants(promise);
}

async function awaitCount(promiseCount: Promise<number>) {
  return promiseCount;
}

export async function ApplicantAwaiterTable(props: {
  promiseData: ApplicantsPromise;
  promiseCount: Promise<number>;
  currentPage: Promise<number>;
}) {
  const { applicantsData } = await awaitData(props.promiseData);
  const countApplicants = await awaitCount(props.promiseCount);
  const currentPage = await props.currentPage;

  return (
    <ApplicantTable
      applicantsData={applicantsData}
      countApplicants={countApplicants}
      currentPage={currentPage}
    />
  );
}

export async function ApplicantAwaiterHeader(props: {
  promiseData: ApplicantsPromise;
  promiseCount: Promise<number>;
}) {
  const { countOpenings } = await awaitData(props.promiseData);
  const countApplicants = await awaitCount(props.promiseCount);

  return (
    <Header
      countApplicants={countApplicants}
      countOpenings={countOpenings}
    />
  );
}

export async function ApplicantAwaiterFilters({
  promiseRoleData,
  promiseSeniorityData,
  promiseAreaData,
  promiseJobOpeningData,
  promiseTagData,
}: {
  promiseRoleData: ReturnType<typeof api.role.getAllRoles>;
  promiseSeniorityData: ReturnType<typeof api.seniority.getAllSeniorities>;
  promiseAreaData: ReturnType<typeof api.area.getAllAreas>;
  promiseJobOpeningData: ReturnType<typeof api.jobOpening.getAllJobOpenings>;
  promiseTagData: ReturnType<typeof api.tag.getAllTags>;
}) {
  const [roleData, seniorityData, areaData, jobOpeningData, tagData] = await Promise.all([
    promiseRoleData,
    promiseSeniorityData,
    promiseAreaData,
    promiseJobOpeningData,
    promiseTagData,
  ]);

  return (
    <Filters
      roleData={roleData}
      seniorityData={seniorityData}
      areaData={areaData}
      jobOpeningData={jobOpeningData}
      tagData={tagData}
    />
  );
}