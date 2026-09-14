import 'server-only'

import { avatarPalette, TagType, ApplicantsPromise } from "../types";
import { ApplicantPagination } from './applicant-pagination';
import { ApplicantTable } from './applicant-table';
import { Header } from './header';
import { Filters } from './filters';

async function Await(promise : ApplicantsPromise) {
    const data = await promise;
    const applicantsData = (data) ? data.applicants.map((applicant) => {
        return {
          id: applicant.id,
          initials: applicant.name[0] + applicant.lastName[0],
          name: applicant.name + ' ' + applicant.lastName,
          avatarBg: avatarPalette[0],
          tags: [{ //applicant.tags, //TODO mapear color -> type
            label: "tag", 
            type: "purple" as TagType,
          }],
          jobOpening: "—", //TODO applicant.applications.jobOpening.name,
          role: applicant.role.name,
          seniority: "Senior",//TODO mapeo color applicant.seniority?.name,
          area: (applicant.area) ? applicant.area.name : "Sin aréa",
          sourceText: "Inbound", //TODO falta en el esquema de DB
          sourceIcon: "f", //TODO 
          hasCv: applicant.resume != null,
          hasLinkedin: applicant.linkedin != null,
          linkedinUrl: (applicant.linkedin != null) ? applicant.linkedin : "undefined",
          email: (applicant.email == null) ? "no email error" : applicant.email,
        }
      }) : [];
    const countApplicants = applicantsData.length
    let uniqueOpenings = new Set<String>();
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
    return (
      <ApplicantPagination countApplicants = { countApplicants }/>
    )
}

export async function ApplicantAwaiterFilters(props : { promise : ApplicantsPromise }) {
    const { applicantsData, countApplicants, countOpenings } = await Await(props.promise);
    return (
      <>
        <Filters/>
      </>
    )
}