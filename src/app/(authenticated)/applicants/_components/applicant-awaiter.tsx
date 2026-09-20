import "server-only";

import { ApplicantsPromise } from "../types";
import { ApplicantTable } from "./applicant-table";
import { Header } from "./header";
import { Filters } from "./filters";
import { ApplicantPagination } from "./applicant-pagination";
import { transformApplicants } from "../utils";

async function awaitData(promise: ApplicantsPromise) {
  const { applicantsData, countApplicants, countOpenings } =
    await transformApplicants(promise);

  return { applicantsData, countApplicants, countOpenings };
}

async function awaitCount(promiseCount: Promise<number>) {
  return await promiseCount;
}

export async function ApplicantAwaiterTable(props: {
  promiseData: ApplicantsPromise;
  promiseCount: Promise<number>;
}) {
  const { applicantsData } = await awaitData(props.promiseData);
  const countApplicants = await awaitCount(props.promiseCount);

  return (
    <ApplicantTable
      applicantsData={applicantsData}
      countApplicants={countApplicants}
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
    <Header countApplicants={countApplicants} countOpenings={countOpenings} />
  );
}

export async function ApplicantAwaiterPagination(props: {
  promiseCount: Promise<number>;
  currentPage: number;
}) {
  const countApplicants = await awaitCount(props.promiseCount);
  return (
    <>
      <ApplicantPagination
        countApplicants={countApplicants}
        currentPage={props.currentPage}
      />
    </>
  );
}

export async function ApplicantAwaiterFilters(props: {
  promiseData: ApplicantsPromise;
}) {
  const { applicantsData } = await awaitData(props.promiseData);

  return <Filters applicants={applicantsData} />;
}
