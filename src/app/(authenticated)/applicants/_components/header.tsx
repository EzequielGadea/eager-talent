"use client";

import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

export function Header(props: {
  countApplicants: number;
  countOpenings: number;
}) {
  const router = useRouter();
  return (
    <>
      {/* Cabezal */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
            Candidatos
          </h1>
          {props.countApplicants == 0 ? (
            <p className="mt-1 text-sm font-normal leading-normal text-dashboard-text-muted">
              No hay candidatos
            </p>
          ) : (
            <p className="mt-1 text-sm font-normal leading-normal text-dashboard-text-muted">
              {props.countApplicants} candidatos activos en{" "}
              {props.countOpenings} vacantes
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push("/applicants/new-applicant")}
            className="pointer-events-none h-8.5 gap-2 rounded-full bg-dashboard-dark px-4 text-[13px] font-semibold leading-none text-white shadow-none hover:bg-dashboard-dark-hover"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo candidato</span>
          </Button>
        </div>
      </header>
    </>
  );
}
