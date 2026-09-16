import "server-only";

import { ApplicantsPromise, transformApplicants } from "../types";
import { ApplicantTable } from "./applicant-table";
import { Header } from "./header";
import { Filters } from "./filters";
import { ApplicantPagination } from "./applicant-pagination";
import ApplicantTableError from "../error";

async function awaitData(promise: ApplicantsPromise) {
  try {
    const { applicantsData, countApplicants, countOpenings } =
      await transformApplicants(promise);
    return { applicantsData, countApplicants, countOpenings, error: null };
  } catch (e) {
    return {
      applicantsData: [],
      countApplicants: 0,
      countOpenings: 0,
      error: e,
    };
  }
}

async function awaitCount(promiseCount: Promise<number>) {
  return await promiseCount;
}

export async function ApplicantAwaiterTable(props: {
  promiseData: ApplicantsPromise;
  promiseCount: Promise<number>;
}) {
  const { applicantsData, error } = await awaitData(props.promiseData);
  const countApplicants = await awaitCount(props.promiseCount);
  if (error == null) {
    return (
      <>
        <ApplicantTable
          applicantsData={applicantsData}
          countApplicants={countApplicants}
        />
      </>
    );
  }
  return <ApplicantTableError />;
}

export async function ApplicantAwaiterHeader(props: {
  promiseData: ApplicantsPromise;
  promiseCount: Promise<number>;
}) {
  const { countOpenings, error } = await awaitData(props.promiseData);
  const countApplicants = await awaitCount(props.promiseCount);
  if (error == null) {
    return (
      <>
        <Header
          countApplicants={countApplicants}
          countOpenings={countOpenings}
        />
      </>
    );
  }
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
  const { applicantsData, error } = await awaitData(props.promiseData);
  if (error == null) {
    return (
      <>
        <Filters applicants={applicantsData} />
      </>
    );
  }
}
