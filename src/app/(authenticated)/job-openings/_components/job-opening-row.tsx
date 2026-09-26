"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { TableCell, TableRow } from "~/components/ui/table";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type JobOpening =
  inferRouterOutputs<AppRouter>["jobOpening"]["getAllJobOpeningsDetailed"][number];

type Props = {
  jobOpening: JobOpening;
  isHiringManagerView: boolean;
};

const statusConfig = {
  Open: {
    label: "Abierta",
    className: "bg-success-bg text-success",
  },
  Paused: {
    label: "Pausada",
    className: "bg-warning-bg text-warning",
  },
  Closed: {
    label: "Cerrada",
    className: "bg-tag-gray-bg text-tag-gray-fg",
  },
  Cancelled: {
    label: "Cancelada",
    className: "bg-danger-bg text-danger",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function HiringManagersCell({
  managers,
}: {
  managers: JobOpening["hiringManagers"];
}) {
  if (managers.length === 0) {
    return <span className="text-text-tertiary">Sin asignar</span>;
  }

  const firstManager = managers[0];

  if (!firstManager) {
    return null;
  }

  const firstManagerName = `${firstManager.name} ${firstManager.lastName}`;

  if (managers.length === 1) {
    return <span className="text-text-secondary">{firstManagerName}</span>;
  }

  const otherManagers = managers.slice(1);

  return (
    <div className="flex items-center gap-1">
      <span className="text-text-secondary">{firstManagerName}</span>

      <Popover>
        <PopoverTrigger
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer text-text-link hover:underline"
        >
          +{otherManagers.length}
        </PopoverTrigger>

        <PopoverContent
          className="w-56 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-2 text-xs font-semibold text-text-primary">
            Otros Hiring Managers
          </p>

          <div className="flex flex-col gap-2">
            {otherManagers.map((manager) => (
              <span key={manager.id} className="text-sm text-text-secondary">
                {manager.name} {manager.lastName}
              </span>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
export default function JobOpeningRow({
  jobOpening,
  isHiringManagerView,
}: Props) {
  const router = useRouter();

  const status = statusConfig[jobOpening.status];

  const formattedDate = new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(jobOpening.openingDate));

  return (
    <TableRow
      onClick={() => router.push(`/job-openings/${jobOpening.id}`)}
      className="group cursor-pointer border-b border-border-default transition-colors last:border-b-0 hover:bg-accent-green/5"
    >
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tag-green-bg text-xs font-semibold text-tag-green-fg">
            {getInitials(jobOpening.name)}
          </div>

          <span className="font-semibold text-text-primary">
            {jobOpening.name}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3 text-text-secondary">
        {jobOpening.area.name}
      </TableCell>

      {!isHiringManagerView && (
        <TableCell className="px-4 py-3 text-text-secondary">
          <HiringManagersCell managers={jobOpening.hiringManagers} />
        </TableCell>
      )}

      <TableCell className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
        >
          <span className="size-1.5 rounded-full bg-current" />

          {status.label}
        </span>
      </TableCell>

     <TableCell className="px-4 py-3">
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-text-primary">
          {jobOpening.applicants}
        </span>

        <span className="text-xs text-text-tertiary">en pipeline</span>
      </div>
    </TableCell>

    {isHiringManagerView && (
      <>
        <TableCell className="px-4 py-3">
          <span className="font-semibold text-text-primary">
            {jobOpening.technicalInterviewApplicants}
          </span>
        </TableCell>

        <TableCell className="px-4 py-3">
          <span className="font-semibold text-text-primary">
            {jobOpening.offeredApplicants}
          </span>
        </TableCell>
      </>
    )}

    <TableCell className="px-4 py-3 text-text-secondary">
      {formattedDate}
    </TableCell>

    <TableCell className="px-4 py-3">
      <ArrowRight
        size={16}
        className="text-text-tertiary transition-transform group-hover:translate-x-1"
      />
    </TableCell>
    </TableRow>
  );
}
