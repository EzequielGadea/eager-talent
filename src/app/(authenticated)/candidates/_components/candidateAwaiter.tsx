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
          tags: [{ //cand.tags, //TODO mapear color -> type
            label: "tag", 
            type: "purple" as TagType,
          }],
          vacancy: "—", //TODO cand.applications.jobOpening.name,
          role: cand.role.name,
          seniority: "Senior",//TODO mapeo color cand.seniority?.name,
          area: (cand.area) ? cand.area.name : "Sin aréa",
          sourceText: "Inbound", //TODO falta en el esquema de DB
          sourceIcon: "f", //TODO 
          hasCv: cand.resume != null,
          hasLinkedin: cand.linkedin != null,
          linkedinUrl: (cand.linkedin != null) ? cand.linkedin : "undefined",
          email: (cand.email == null) ? "no email error" : cand.email,
        }
      }) : [];
    const countCand = candidatesData.length
    let uniqueVacancy = new Set<String>();
    for (var cand of candidatesData) {
      for (var vac of cand.vacancy) {
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
        <Filters/>
      </>
    )
}