"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Briefcase,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { api } from "~/lib/trpc/server";
import { Button } from "~/components/ui/button";
import { ApplyToVacantDialog } from "./apply-to-vacant-dialog";
import { DeleteApplicantDialog } from "./delete-applicant-dialog";
import { useState } from "react";
import { ExportApplicantNotesDialog } from "./export-applicant-notes-dialog";

type Applicant = Awaited<ReturnType<typeof api.applicant.getById>>;

const dangerItemClassName =
  "text-danger! hover:text-danger! focus:text-danger! data-highlighted:text-danger! [&_svg]:text-danger! hover:[&_svg]:text-danger! focus:[&_svg]:text-danger! data-highlighted:[&_svg]:text-danger!";

export function ApplicantActionsMenu({
  canUpdateApplicant,
  applicant,
  canDeleteApplicant,
  canCreateApplication,
  canExportNotes,
  defaultShow,
}: {
  canUpdateApplicant: boolean;
  applicant: Applicant;
  canDeleteApplicant: boolean;
  canCreateApplication: boolean;
  canExportNotes: boolean;
  defaultShow: boolean;
}) {
  const [showDialog, setShowDialog] = useState(defaultShow ?? false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const applicantName = `${applicant.name} ${applicant.lastName}`.trim();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-lg hover:bg-muted"
            />
          }
        >
          <MoreHorizontal className="size-4 text-text-tertiary" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuGroup>
            {canUpdateApplicant && (
              <DropdownMenuItem
                render={
                  <Link href={`/applicants/${applicant.id}/edit-applicant`} />
                }
                className="gap-2"
              >
                <Pencil />
                <span>Editar datos del candidato</span>
              </DropdownMenuItem>
            )}
            {canCreateApplication && (
              <DropdownMenuItem
                className="gap-2"
                onClick={(event) => {
                  event.preventDefault();
                  setShowDialog(true);
                }}
                onSelect={(event) => {
                  event.preventDefault();
                  setShowDialog(true);
                }}
              >
                <Briefcase />
                <span>
                  {applicant._count.applications > 0
                    ? "Postular a otra vacante"
                    : "Postular a una vacante"}
                </span>
              </DropdownMenuItem>
            )}
            {canExportNotes && (
              <DropdownMenuItem
                className="gap-2"
                onClick={(event) => {
                  event.preventDefault();
                  setShowExportDialog(true);
                }}
                onSelect={(event) => {
                  event.preventDefault();
                  setShowExportDialog(true);
                }}
              >
                <Download />
                <span>Exportar notas del candidato</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          {(canUpdateApplicant || canCreateApplication || canExportNotes) &&
            canDeleteApplicant && <DropdownMenuSeparator />}
          {canDeleteApplicant && (
            <DropdownMenuGroup>
              <DropdownMenuItem
                className={dangerItemClassName}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 />
                <span>Eliminar candidato</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ApplyToVacantDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        applicantId={applicant.id}
      />

      {canDeleteApplicant && (
        <DeleteApplicantDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          applicantId={applicant.id}
          applicantName={applicantName}
        />
      )}

      {canExportNotes && (
        <ExportApplicantNotesDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          applicantId={applicant.id}
          applicantName={applicantName}
        />
      )}
    </>
  );
}
