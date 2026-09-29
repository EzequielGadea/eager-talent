import "server-only";

import { ApplicantsPromise, SharedApplicantsPromise } from "../types";
import { ApplicantTable } from "./applicant-table";
import { Header } from "./header";
import { Filters } from "./filters";
import { transformApplicants } from "../utils";
import { api } from "~/lib/trpc/server";
import { SharedApplicantsTable } from "./shared-applicant-table";

async function awaitData(promise: ApplicantsPromise) {
  const { applicantsData, countApplicants, countOpenings } =
    await transformApplicants(promise);

  return { applicantsData, countApplicants, countOpenings };
}

export async function ApplicantAwaiterTable(props: {
  promiseData: ApplicantsPromise;
  promiseCount: Promise<number>;
  currentPage: Promise<number>;
  isHiringManagerView: boolean;
}) {
  const { applicantsData } = await awaitData(props.promiseData);
  const countApplicants = await props.promiseCount;
  const currentPage = await props.currentPage;

  return (
    <ApplicantTable
      applicantsData={applicantsData}
      countApplicants={countApplicants}
      currentPage={currentPage}
      isHiringManagerView={props.isHiringManagerView}
    />
  );
}

export async function ApplicantAwaiterHeader(props: {
  promiseCountApplicants: Promise<number>;
  promiseCountOpenings: ReturnType<typeof api.jobOpening.getAllJobOpenings>;
  promiseSharedData: SharedApplicantsPromise | null;
  isHiringManagerView: boolean;
}) {
  const countApplicants = await props.promiseCountApplicants;
  const countOpenings = (await props.promiseCountOpenings)?.length;

  const countSharedApplicants = props.promiseSharedData
    ? (await props.promiseSharedData).total
    : 0;

  const totalApplicants = props.isHiringManagerView
    ? countApplicants + countSharedApplicants
    : countApplicants;

  return (
    <Header
      countApplicants={totalApplicants}
      countOpenings={countOpenings}
      countSharedApplicants={countSharedApplicants}
      isHiringManagerView={props.isHiringManagerView}
    />
  );
}

export async function ApplicantAwaiterFilters({
  promiseRoleData,
  promiseSeniorityData,
  promiseAreaData,
  promiseJobOpeningData,
  promiseTagData,
  isHiringManagerView,
}: {
  promiseRoleData: ReturnType<typeof api.role.getAllRoles>;
  promiseSeniorityData: ReturnType<typeof api.seniority.getAllSeniorities>;
  promiseAreaData: ReturnType<typeof api.area.getAllAreas>;
  promiseJobOpeningData: ReturnType<typeof api.jobOpening.getAllJobOpenings>;
  promiseTagData: ReturnType<typeof api.tag.getAllTags>;
  isHiringManagerView: boolean;
}) {
  const [roleData, seniorityData, areaData, jobOpeningData, tagData] =
    await Promise.all([
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
      isHiringManagerView={isHiringManagerView}
    />
  );
}

export async function SharedApplicantsAwaiter(props: {
  promiseData: SharedApplicantsPromise;
  currentPage: Promise<number>;
}) {
  const [{ applicantsData }, data, currentPage] = await Promise.all([
    transformApplicants(props.promiseData),
    props.promiseData,
    props.currentPage,
  ]);

  return (
    <SharedApplicantsTable
      applicantsData={applicantsData}
      countApplicants={data.total}
      currentPage={currentPage}
    />
  );
}