"use client";

import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { Share2 } from "lucide-react";
export function Header(props: {
  countApplicants: number;
  countOpenings: number;
  countSharedApplicants: number;
  isHiringManagerView: boolean;
}) {
  const router = useRouter();

  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
          Candidatos
        </h1>

        {props.isHiringManagerView ? (
          <p className="mt-1 text-sm font-normal leading-normal text-dashboard-text-muted">
            Los candidatos de tus vacantes asignadas y los perfiles que un
            recruiter compartió con vos
          </p>
        ) : props.countApplicants === 0 ? (
          <p className="mt-1 text-sm font-normal leading-normal text-dashboard-text-muted">
            No hay candidatos
          </p>
        ) : (
          <p className="mt-1 text-sm font-normal leading-normal text-dashboard-text-muted">
            {props.countApplicants} candidatos activos en {props.countOpenings}{" "}
            vacantes
          </p>
        )}
      </div>
      {props.isHiringManagerView && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-dashboard-text-muted">
              {props.countApplicants} candidatos
            </span>

            <span className="inline-flex items-start gap-1.5 rounded-full bg-tag-purple-bg px-3 py-1 text-xs font-semibold text-tag-purple-fg">
              <Share2 className="mt-0.5 size-3.5 shrink-0" />
              <span>{props.countSharedApplicants} perfiles compartidos con vos</span>
            </span>
          </div>
        )}
      {!props.isHiringManagerView && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push("/applicants/new-applicant")}
            className="h-8.5 gap-2 rounded-full bg-dashboard-dark px-4 text-[13px] font-semibold text-white shadow-none hover:bg-dashboard-dark-hover"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo candidato</span>
          </Button>
        </div>
      )}
    </header>
  );
}