import "server-only";

import { ApplicantsPromise } from "../types";
import { ApplicantTable } from "./applicant-table";
import { Header } from "./header";
import { Filters } from "./filters";
import { transformApplicants } from "../utils";
import { api } from "~/lib/trpc/server";

async function awaitData(promise: ApplicantsPromise) {
  const { applicantsData, countApplicants, countOpenings } =
    await transformApplicants(promise);

  return { applicantsData, countApplicants, countOpenings };
}

export async function ApplicantAwaiterTable(props: {
  promiseData: ApplicantsPromise;
  promiseCount: Promise<number>;
  currentPage: Promise<number>;
}) {
  const { applicantsData } = await awaitData(props.promiseData);
  const countApplicants = await props.promiseCount;
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
  promiseCountApplicants: Promise<number>;
  promiseCountOpenings: ReturnType<typeof api.jobOpening.getAllJobOpenings>;
}) {
  const countApplicants = await props.promiseCountApplicants;
  const countOpenings = (await props.promiseCountOpenings)?.length;
  return (
    <Header countApplicants={countApplicants} countOpenings={countOpenings} />
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
    />
  );
}
