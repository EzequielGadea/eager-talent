import 'server-only'

import { avatarPalette, TagType, CandidatesPromise } from "../types";
import { CandidatePagination } from './candidatePagination';
import { CandidateTable } from './candidateTable';
import { Header } from './header';
import { Filters } from './filters';

async function Await(promise : CandidatesPromise) {
    const data = await promise;
    const candidatesData = (data) ? data.candidates.map((cand) => {
        return {
          id: cand.id,
          initials: cand.name[0] + cand.lastName[0],
          name: cand.name + ' ' + cand.lastName,
          avatarBg: avatarPalette[0],
          tags: (cand.tags) ? cand.tags.map(
            (tag) => ({
              label: tag.name,
              type: "purple" as TagType, //TODO mapear color -> type
            })
            ) : [],
          vacancy: (cand.applications) ? cand.applications.map(
            application => application.jobOpening.name) : [], 
          role: (cand.role.name) ?? "-",
          seniorityName: (cand.seniority?.name) ?? "-",
          seniorityColor: (cand.seniority?.color) ?? "-",
          area: (cand.area?.name) ?? "-",
          sourceText: (cand.source)  ?? "-", 
          sourceIcon: "f", //TODO 
          hasCv: cand.resume != null,
          hasLinkedin: cand.linkedin != null,
          linkedinUrl: (cand.linkedin != null) ? cand.linkedin : "-",
          email: (cand.email == null) ? "-" : cand.email,
        }
      }) : [];
    const countCand = candidatesData.length
    const uniqueVacancy = new Set<string>();
    for (const cand of candidatesData) {
      for (const vac of cand.vacancy) {
        uniqueVacancy.add(vac);
      }
    }
    const countVacancy = (uniqueVacancy.has("—")) ? uniqueVacancy.size - 1 : uniqueVacancy.size
    return { candidatesData, countCand, countVacancy };
}

export async function CandidateAwaiterTable(props : {promise: CandidatesPromise }) {
    const { candidatesData, countCand, countVacancy } = await Await(props.promise);
    return (
      <>
        <CandidateTable candidatesData = { candidatesData }/>
      </>
    )
}

export async function CandidateAwaiterHeader(props : { promise : CandidatesPromise }) {
    const { candidatesData, countCand, countVacancy } = await Await(props.promise);
    return (
      <>  
        <Header 
          countCand = { countCand }
          countVacancy = { countVacancy }/>
      </>
    )
}

export async function CandidateAwaiterPagination(props : { promise : CandidatesPromise }) {
    const { candidatesData, countCand, countVacancy } = await Await(props.promise);
    return (
      <CandidatePagination countCand = { countCand }/>
    )
}

export async function CandidateAwaiterFilters(props : { promise : CandidatesPromise }) {
    const { candidatesData, countCand, countVacancy } = await Await(props.promise);
    return (
      <>
        <Filters candidates={candidatesData}/>
      </>
    )
}