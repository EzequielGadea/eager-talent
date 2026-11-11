"use client";

import { Download, FileUp, MoreHorizontal, Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { ExportApplicantsDialog } from "./export-applicants-dialog";
import { ImportApplicantsButton } from "./import-applicants-button";
export function Header(props: {
  countApplicants: number;
  countOpenings: number;
  countSharedApplicants: number;
  isHiringManagerView: boolean;
}) {
  const router = useRouter();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

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
          <Button
            size="sm"
            onClick={() => router.push("/applicants/new-applicant")}
            className="h-8.5 w-8.5 gap-2 rounded-full bg-surface-dark px-0 text-small font-semibold text-text-on-dark shadow-none hover:bg-surface-dark/90 md:w-auto md:px-4"
          >
            <Plus size={16} />
            {/* Icon-only on mobile; the label stays available to screen readers. */}
            <span className="sr-only md:not-sr-only">Nuevo candidato</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Más acciones de candidatos"
                  className="size-8 rounded-lg hover:bg-muted"
                />
              }
            >
              <MoreHorizontal className="size-4 text-text-tertiary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => importFileInputRef.current?.click()}
                >
                  <FileUp />
                  <span>Importar candidatos</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => setIsExportDialogOpen(true)}
                >
                  <Download />
                  <span>Exportar todos los candidatos</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <ExportApplicantsDialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
          />
          <ImportApplicantsButton fileInputRef={importFileInputRef} />
        </div>
      )}
    </header>
  );
}
