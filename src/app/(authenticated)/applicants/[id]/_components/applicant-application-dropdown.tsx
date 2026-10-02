"use client";

import { Briefcase, Check, ChevronDown, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type {
  ApplicationSummary,
  Interview,
} from "./applicant-applications-card";

export type ApplicationSelection =
  { type: "application"; jobOpeningId: string } | { type: "exploration" };

type ApplicantApplicationDropdownProps = {
  applicantName: string;
  applications: ApplicationSummary[];
  explorationInterviews: Interview[];
  selection: ApplicationSelection | undefined;
  onSelectionChange: (selection: ApplicationSelection) => void;
  canCreateApplication: boolean;
  onCreateApplication: () => void;
};

function getDropdownApplicationStatus(application: { active: boolean }) {
  return application.active
    ? { label: "En proceso", className: "bg-info-bg text-info" }
    : { label: "Descartado", className: "bg-danger-bg text-danger" };
}

function buildApplicationSubtitle(application: ApplicationSummary) {
  const dateLabel = application.applicationDate
    ? format(new Date(application.applicationDate), "d MMM yyyy", {
        locale: es,
      })
    : "—";

  return [
    application.currentStage,
    application.disqualificationReason,
    `postuló ${dateLabel}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function ApplicantApplicationDropdown({
  applicantName,
  applications,
  explorationInterviews,
  selection,
  onSelectionChange,
  canCreateApplication,
  onCreateApplication,
}: ApplicantApplicationDropdownProps) {
  const isExplorationSelected = selection?.type === "exploration";
  const selectedJobOpeningId =
    selection?.type === "application" ? selection.jobOpeningId : undefined;
  const selectedApplication = applications.find(
    (a) => a.jobOpeningId === selectedJobOpeningId,
  );
  const triggerLabel = isExplorationSelected
    ? "Base de Talentos"
    : (selectedApplication ?? applications[0])?.jobOpening.name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group/dropdown-trigger relative flex h-auto min-h-9 w-full max-w-full items-center gap-2 rounded-xl border border-border-strong bg-background py-1.5 pl-3 pr-8 text-left text-sm font-semibold text-text-primary transition hover:border-text-tertiary hover:bg-tag-gray-bg focus-visible:ring-2 focus-visible:ring-tag-gray-bg data-popup-open:border-accent-green data-popup-open:ring-1 data-popup-open:ring-accent-green sm:w-56 lg:w-72">
        <Briefcase className="h-4 w-4 shrink-0 text-text-secondary" />
        <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-text-tertiary transition-transform group-data-popup-open/dropdown-trigger:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="max-h-80 w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border-strong p-0 shadow-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="border-b border-border-default bg-surface-subtle px-3.25 py-2.25 text-[11px] font-bold tracking-wider text-text-tertiary uppercase">
            Postulaciones de {applicantName}
          </DropdownMenuLabel>
          {applications.map((application) => {
            const isSelected =
              application.jobOpeningId === selectedJobOpeningId;
            const status = getDropdownApplicationStatus(application);

            return (
              <DropdownMenuItem
                key={application.jobOpeningId}
                onClick={() =>
                  onSelectionChange({
                    type: "application",
                    jobOpeningId: application.jobOpeningId,
                  })
                }
                className={cn(
                  "flex w-full cursor-pointer items-start gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors data-highlighted:bg-tag-gray-bg",
                  isSelected && "bg-success-bg data-highlighted:bg-success-bg",
                )}
              >
                <Check
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-tag-green-fg!",
                    !isSelected && "invisible",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-text-primary!">
                      {application.jobOpening.name}
                    </span>
                    <Badge
                      className={cn(
                        "shrink-0 border-transparent",
                        status.className,
                      )}
                    >
                      {status.label}
                    </Badge>
                  </span>
                  <span className="mt-0.5 block wrap-break-word whitespace-normal text-xs text-text-tertiary!">
                    {buildApplicationSubtitle(application)}
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        {explorationInterviews.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => onSelectionChange({ type: "exploration" })}
              className={cn(
                "flex w-full cursor-pointer items-start gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors data-highlighted:bg-tag-gray-bg",
                isExplorationSelected &&
                  "bg-success-bg data-highlighted:bg-success-bg",
              )}
            >
              <Check
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 text-tag-green-fg!",
                  !isExplorationSelected && "invisible",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-text-primary!">
                    Base de Talentos
                  </span>
                  <Badge className="shrink-0 border-transparent bg-tag-purple-bg text-tag-purple-fg!">
                    Sin postulación
                  </Badge>
                </span>
                <span className="mt-0.5 block wrap-break-word whitespace-normal text-xs text-text-tertiary!">
                  {`Entrevistas exploratorias, no asociadas a una vacante · ${explorationInterviews.length} registro${explorationInterviews.length === 1 ? "" : "s"}`}
                </span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {canCreateApplication && (
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(event) => {
                event.preventDefault();
                onCreateApplication();
              }}
              onSelect={(event) => {
                event.preventDefault();
                onCreateApplication();
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-none border-t border-border-default bg-surface-subtle px-3.25 py-2.75 text-xs font-semibold text-text-link no-underline hover:bg-surface-subtle hover:text-text-link focus:bg-surface-subtle focus:text-text-link data-highlighted:bg-surface-subtle data-highlighted:text-text-link"
            >
              <Plus className="text-text-link group-hover/dropdown-menu-item:text-text-link group-focus/dropdown-menu-item:text-text-link group-data-highlighted/dropdown-menu-item:text-text-link" />
              <span className="text-text-link group-hover/dropdown-menu-item:text-text-link group-hover/dropdown-menu-item:underline group-focus/dropdown-menu-item:text-text-link group-focus/dropdown-menu-item:underline group-data-highlighted/dropdown-menu-item:text-text-link group-data-highlighted/dropdown-menu-item:underline">
                Postular a otra vacante
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
