"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { Briefcase, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { api } from "~/lib/trpc/server";
import { Button } from "~/components/ui/button";
import { ApplyToVacantDialog } from "./apply-to-vacant-dialog";
import { useState } from "react";

type Applicant = Awaited<ReturnType<typeof api.applicant.getById>>;

export function ApplicantActionsMenu({
  canUpdateApplicant,
  applicant,
  canDeleteApplicant,
  defaultShow,
}: {
  canUpdateApplicant: boolean;
  applicant: Applicant;
  canDeleteApplicant: boolean;
  defaultShow: boolean;
}) {
  const [showDialog, setShowDialog] = useState(defaultShow ?? false);

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
          {canUpdateApplicant && (
            <>
              <DropdownMenuItem
                render={
                  <Link href={`/applicants/${applicant.id}/edit-applicant`} />
                }
                className="gap-2"
              >
                <Pencil className="size-4" />
                <span>Editar datos del candidato</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDialog(true);
                }}
                onSelect={(e) => {
                  e.preventDefault();
                  setShowDialog(true);
                }}
              >
                <Briefcase className="size-4" />
                <span>Postular candidato</span>
              </DropdownMenuItem>
            </>
          )}
          {canUpdateApplicant && canDeleteApplicant && (
            <DropdownMenuSeparator />
          )}
          {canDeleteApplicant && (
            <DropdownMenuItem
              className={cn(
                "gap-2 text-danger hover:bg-danger-bg hover:text-tag-red-fg",
              )}
            >
              <Trash2 className="size-4" />
              <span>Eliminar candidato</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ApplyToVacantDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        applicantId={applicant.id}
      />
    </>
  );
}
