'use client'

import {
    Download,
    Plus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

export function Header(props : {countApplicants : number, countOpenings : number}) {
  const router = useRouter();  
  return (
    <>
      {/* Cabezal */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-dashboard-dark">
            Candidatos
          </h1>
          <p className="mt-0.5 text-base font-medium text-dashboard-text-muted">
            {props.countApplicants} candidatos activos en {props.countOpenings} vacantes
          </p>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full border-dashboard-border bg-white px-5 py-5 text-sm font-medium text-dashboard-text-muted shadow-xs hover:bg-dashboard-track hover:text-dashboard-text-muted"
          >
            <Download size={16} className="text-dashboard-text-muted" />
            <span>Exportar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => router.push("/candidatos/alta")}
            className="h-9 gap-1.5 rounded-full bg-dashboard-dark px-5 py-5 text-sm font-medium text-white shadow-xs hover:bg-dashboard-dark-hover"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Añadir</span>
          </Button>
        </div>
      </header>
    </>
    );
}