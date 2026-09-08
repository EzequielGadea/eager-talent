import { Suspense } from "react";
import Loading from "~/components/ui/loading";
import { Button } from "~/components/ui/button";
import  DatosPersonales  from "./_components/datos-personales";
import PerfilProfesional from "./_components/perfil-profesional";
import { Card } from "~/components/ui/card";






export default function newCandidatePage() {
  return (
    <div className="flex flex-col gap-4 align-center justify-center bg-gray-100 p-4"> 
        <DatosPersonales></DatosPersonales>
        <PerfilProfesional></PerfilProfesional>
    </div>
  );}
