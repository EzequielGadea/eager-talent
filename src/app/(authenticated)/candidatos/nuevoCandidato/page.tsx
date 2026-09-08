

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






export default function newCandidatePage() {
  return (
    <NewCandidateForm></NewCandidateForm>
  );}
