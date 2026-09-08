

import { Suspense } from "react";
import Loading from "~/components/ui/loading";
import { Button } from "~/components/ui/button";
import  PersonalData  from "./_components/personal-data";
import ProfessionalProfile from "./_components/professional-profile";
import SourceAndTags from "./_components/source-and-labels";
import EducationAndFiles from "./_components/education-and-files";
import NewCandidateButton from "./_components/new-candidate-button";
import NewCandidateForm from "./_components/new-candidate-form";
import { Card } from "~/components/ui/card";

import { api } from  "~/lib/trpc/server";




// como new-candidate-form y professional-profile son "use client" components, no se pueden usar directamente en un 
// componente de servidor. Por eso, se pasa la data de areas como prop a new-candidate-form, 
// y este a su vez la pasa a professional-profile.

// en server/api cree la carpeta routers/area con un index el cual va a traer todas los .ts que esten dentro de esa carpeta, para exportar solamente uno y 
// no hacerlo 1 x 1.

//En root.ts dentro de server/api agregue el areaRouter para que pueda ser llamado desde el front.

export default async function newCandidatePage() {
  const areas = await api.area.getAllAreas({});
  return (
    <NewCandidateForm areas={areas}></NewCandidateForm>
  );}
