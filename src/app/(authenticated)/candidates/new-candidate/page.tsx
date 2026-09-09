

import { Suspense } from "react";
import Loading from "~/components/ui/loading";
import { Button } from "~/components/ui/button";
import  PersonalData  from "./_components/personal-data";
import ProfessionalProfile from "./_components/professional-profile";
import SourceAndTags from "./_components/source-and-tags";
import EducationAndFiles from "./_components/education-and-files";
import NewCandidateButton from "./_components/new-candidate-button";
import NewCandidateForm from "./_components/new-candidate-form";
import { Card } from "~/components/ui/card";

import { api } from  "~/lib/trpc/server";




// si se podía hacer desde componente cliente, cambia un poco la instrucción. Lo hicimos de esa manera,
// y queda más cómodo para renderizar.

// en server/api cree la carpeta routers/area con un index el cual va a traer todas los .ts que esten dentro de esa carpeta, para exportar solamente uno y 
// no hacerlo 1 x 1.

//En root.ts dentro de server/api agregue el areaRouter para que pueda ser llamado desde el front.

export default async function newCandidatePage() {
  
  return (
    <NewCandidateForm/>
  );}
