"use client";

import { Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";

import { ExportApplicantsDialog } from "./export-applicants-dialog";

export function Header(props: {
  countApplicants: number;
  countOpenings: number;
  countSharedApplicants: number;
  isHiringManagerView: boolean;
}) {
  const router = useRouter();

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div
        className={
          props.isHiringManagerView
            ? "min-w-0 flex-[1_1_20rem]"
            : "min-w-0 flex-1"
        }
      >
        <h1 className="font-heading text-h1 text-text-primary">Candidatos</h1>

        {props.isHiringManagerView ? (
          <p className="mt-1 text-sm font-normal leading-normal text-text-secondary">
            Los candidatos de tus vacantes asignadas y los perfiles que un
            recruiter compartió con vos
          </p>
        ) : props.countApplicants === 0 ? (
          <p className="mt-1 text-sm font-normal leading-normal text-text-secondary">
            No hay candidatos
          </p>
        ) : (
          <p className="mt-1 text-sm font-normal leading-normal text-text-secondary">
            {props.countApplicants} candidatos activos en {props.countOpenings}{" "}
            vacantes
          </p>
        )}
      </div>
      {props.isHiringManagerView && (
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          <span className="inline-flex items-start gap-1.5 rounded-full bg-tag-purple-bg px-3 py-1 text-xs font-semibold text-tag-purple-fg">
            <Share2 className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {props.countSharedApplicants} perfiles compartidos con vos
            </span>
          </span>
        </div>
      )}
      {!props.isHiringManagerView && (
        <div className="flex items-center gap-2">
          <ExportApplicantsDialog />
          <Button
            size="sm"
            onClick={() => router.push("/applicants/new-applicant")}
            className="h-8.5 w-8.5 gap-2 rounded-full bg-surface-dark px-0 text-small font-semibold text-text-on-dark shadow-none hover:bg-surface-dark/90 md:w-auto md:px-4"
          >
            <Plus size={16} />
            {/* Icon-only on mobile; the label stays available to screen readers. */}
            <span className="sr-only md:not-sr-only">Nuevo candidato</span>
          </Button>
        </div>
      )}
    </header>
  );
}
