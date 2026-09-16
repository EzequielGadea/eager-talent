import 'server-only'

import { getRandomColor, transformApplicants } from "../utils";
import { ApplicantsPromise } from '../types';
import { ApplicantPagination } from './applicant-pagination';
import { ApplicantTable } from './applicant-table';
import { Header } from './header';
import { Filters } from './filters';
import { api } from '~/lib/trpc/server';
import { promises } from 'dns';


async function awaitData(promise: ApplicantsPromise) {
  return transformApplicants(promise)
}

async function awaitCount(promiseCount: Promise<number>) {
  return await promiseCount
}

export async function ApplicantAwaiterTable(props: { promiseData: ApplicantsPromise, promiseCount: Promise<number> }) {
  const { applicantsData } = await awaitData(props.promiseData);
  const countApplicants = await awaitCount(props.promiseCount)
  return (
    <>
      <ApplicantTable applicantsData={applicantsData} countApplicants={countApplicants} />
    </>
  )
}

export async function ApplicantAwaiterHeader(props: { promiseData: ApplicantsPromise, promiseCount: Promise<number> }) {
  const { countOpenings } = await awaitData(props.promiseData);
  const countApplicants = await awaitCount(props.promiseCount)
  return (
    <>
      <Header
        countApplicants={countApplicants}
        countOpenings={countOpenings} />
    </>
  )
}

export async function ApplicantAwaiterPagination(props: { promiseData: ApplicantsPromise }) {
  const { applicantsData, countApplicants, countOpenings } = await awaitData(props.promiseData);
  /*return (
    <ApplicantPagination countApplicants = { countApplicants }/>
  )*/
  return
}

export async function ApplicantAwaiterFilters({
  promiseRoleData,
  promiseSeniorityData,
  promiseAreaData,
  promiseJobOpeningData,
  PromiseTagData,
}) {
  const [
    roleData,
    seniorityData,
    areaData,
    jobOpeningData,
    tagData,
  ] = await Promise.all(
    [
      promiseRoleData,
      promiseSeniorityData,
      promiseAreaData,
      promiseJobOpeningData,
      PromiseTagData,
    ]);

  return (
    <>
      <Filters
        roleData={roleData}
        senioritData = {seniorityData}
        areaData = {areaData}
        jobOpeningData = {jobOpeningData}
        tagData = {tagData}
      />
    </>
  )

}