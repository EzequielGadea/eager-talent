import 'server-only'

import { ApplicantsPromise, getRandomColor } from "../types";
import { ApplicantPagination } from './applicant-pagination';
import { ApplicantTable } from './applicant-table';
import { Header } from './header';
import { Filters } from './filters';

async function Await(promise : ApplicantsPromise) {
    const data = await promise;
    const applicantsData = (data) ? data.applicants.map((applicant) => {

      const jobOpenings = (applicant.applications) ? applicant.applications
        .filter((application) =>  (application.active))
        .map(
          application => {
            if (application.active) { return application.jobOpening.name }
          },
      ) : [];
        return {
          id: applicant.id,
          initials: applicant.name[0] + applicant.lastName[0],
          name: applicant.name + ' ' + applicant.lastName,
          avatarBg: getRandomColor(),
          tags: (applicant.tags) ? applicant.tags.map(
            (tag) => ({
              label: tag.name,
              color: tag.color,
            })
          ) : [],

          jobOpening: jobOpenings.length ? jobOpenings.join(", \r\n") : "-",

          role: (applicant.role.name) ?? "-",
          seniorityName: (applicant.seniority?.name) ?? "-",
          seniorityColor: (applicant.seniority?.color) ?? "-",
          area: (applicant.area?.name) ?? "-",
          sourceText: (applicant.source)  ?? "-",
          sourceIcon: "TODO"
       }
    }) : [];
    
    const countApplicants = applicantsData.length
    const uniqueOpenings = new Set<String>();
    for (const applicant of applicantsData) {
      for (const open of applicant.jobOpening) {
        uniqueOpenings.add(open);
      }
    }
    const countOpenings = (uniqueOpenings.has("—")) ? uniqueOpenings.size - 1 : uniqueOpenings.size
    return { applicantsData, countApplicants, countOpenings };
}

export async function ApplicantAwaiterTable(props : {promise: ApplicantsPromise }) {
    const { applicantsData, countApplicants, countOpenings } = await Await(props.promise);
    return (
      <>
        <ApplicantTable applicantsData = { applicantsData }/>
      </>
    )
}

export async function ApplicantAwaiterHeader(props : { promise : ApplicantsPromise }) {
    const { applicantsData, countApplicants, countOpenings } = await Await(props.promise);
    return (
      <>  
        <Header 
          countApplicants = { countApplicants }
          countOpenings = { countOpenings }/>
      </>
    )
}

export async function ApplicantAwaiterPagination(props : { promise : ApplicantsPromise }) {
    const { applicantsData, countApplicants, countOpenings } = await Await(props.promise);
    /*return (
      <ApplicantPagination countApplicants = { countApplicants }/>
    )*/
   return
}

export async function ApplicantAwaiterFilters(props : { promise : ApplicantsPromise }) {
    const { applicantsData, countApplicants, countOpenings } = await Await(props.promise);
    return (
      <>
        <Filters applicants = { applicantsData }/>
      </>
    )
}