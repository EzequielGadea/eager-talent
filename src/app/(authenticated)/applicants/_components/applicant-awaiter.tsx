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
                    tags: (applicant.tags) ? applicant.tags.map(
            (tag) => ({
              label: tag.name,
              type: "purple" as TagType, //TODO mapear color -> type
            })
            ) : [],
          jobOpening: (applicant.applications) ? applicant.applications.map(
            application => application.jobOpening.name) : [], 
          role: (applicant.role.name) ?? "-",
          seniorityName: (applicant.seniority?.name) ?? "-",
          seniorityColor: (applicant.seniority?.color) ?? "-",
          area: (applicant.area?.name) ?? "-",
          sourceText: (applicant.source)  ?? "-",
          sourceIcon: "f", //TODO 
          hasCv: applicant.resume != null,
          hasLinkedin: applicant.linkedin != null,
          linkedinUrl: (applicant.linkedin != null) ? applicant.linkedin : "-",
          email: (applicant.email == null) ? "-" : applicant.email,
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
    return (
      <ApplicantPagination countApplicants = { countApplicants }/>
    )
}

export async function ApplicantAwaiterFilters(props : { promise : ApplicantsPromise }) {
    const { applicantsData, countApplicants, countOpenings } = await Await(props.promise);
    return (
      <>
        <Filters applicants = { applicantsData }/>
      </>
    )
}