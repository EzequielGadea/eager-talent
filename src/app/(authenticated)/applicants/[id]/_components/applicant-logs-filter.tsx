"use client";

import { ChevronDown, Filter } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type ApplicantLogsFilterProps = {
  applications: { jobOpeningId: string; name: string }[];
  jobOpeningId?: string;
  onFilterChange: (jobOpeningId: string | undefined) => void;
};

export function ApplicantLogsFilter({
  applications,
  jobOpeningId,
  onFilterChange,
}: ApplicantLogsFilterProps) {
  const selectedApplication = applications.find(
    (application) => application.jobOpeningId === jobOpeningId,
  );
  const selectedLabel = selectedApplication?.name ?? "Todas las postulaciones";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={applications.length === 0}
            aria-label="Filtrar logs por postulación"
            className="relative h-auto min-h-11 w-96 max-w-[calc(100vw-2rem)] gap-2 rounded-xl border-border-strong bg-background py-2 pl-3 pr-8 text-left text-sm font-semibold text-text-primary"
          />
        }
      >
        <Filter className="size-4 shrink-0 text-text-secondary" />
        <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
        <ChevronDown className="absolute top-1/2 right-3 size-4 -translate-y-1/2 shrink-0 text-text-tertiary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-60 w-96 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border-strong p-1.5 shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => onFilterChange(undefined)}
          className={cn(
            "flex w-full min-w-0 cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors data-highlighted:bg-tag-gray-bg data-highlighted:text-text-primary",
            !jobOpeningId
              ? "bg-tag-gray-bg font-semibold text-text-primary"
              : "font-medium text-tag-gray-fg hover:bg-tag-gray-bg hover:text-text-primary",
          )}
        >
          <span className="wrap-break-word whitespace-normal">
            Todas las postulaciones
          </span>
        </DropdownMenuItem>
        {applications.map((application) => (
          <DropdownMenuItem
            key={application.jobOpeningId}
            onClick={() => onFilterChange(application.jobOpeningId)}
            className={cn(
              "flex w-full min-w-0 cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors data-highlighted:bg-tag-gray-bg data-highlighted:text-text-primary",
              jobOpeningId === application.jobOpeningId
                ? "bg-tag-gray-bg font-semibold text-text-primary"
                : "font-medium text-tag-gray-fg hover:bg-tag-gray-bg hover:text-text-primary",
            )}
          >
            <span className="wrap-break-word whitespace-normal">
              {application.name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
