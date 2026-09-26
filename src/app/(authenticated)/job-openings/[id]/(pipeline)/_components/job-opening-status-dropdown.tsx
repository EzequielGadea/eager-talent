"use client";

import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { api } from "~/lib/trpc/react";

type JobOpeningStatusDropdownProps = {
  jobOpeningId: string;
  status: JobOpeningStatus;
  canUpdate: boolean;
};

const statusStyles: Record<
  string,
  {
    badgeClassName: string;
    dotClassName: string;
  }
> = {
  Open: {
    badgeClassName: "bg-success-bg text-success",
    dotClassName: "bg-success",
  },
  Paused: {
    badgeClassName: "bg-warning-bg text-warning",
    dotClassName: "bg-warning",
  },
  Closed: {
    badgeClassName: "bg-muted text-muted-foreground",
    dotClassName: "bg-muted-foreground",
  },
  Cancelled: {
    badgeClassName: "bg-danger-bg text-danger",
    dotClassName: "bg-danger",
  },
};

const fallbackStatusStyle = {
  badgeClassName: "bg-muted text-muted-foreground",
  dotClassName: "bg-muted-foreground",
};

export function JobOpeningStatusDropdown({
  jobOpeningId,
  status,
  canUpdate,
}: JobOpeningStatusDropdownProps) {
  const router = useRouter();

  const updateStatusMutation = api.jobOpening.updateStatus.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const statusStyle = statusStyles[status] ?? fallbackStatusStyle;

  function handleStatusChange(nextStatus: JobOpeningStatus) {
    if (nextStatus === status || updateStatusMutation.isPending) {
      return;
    }

    updateStatusMutation.mutate({
      jobOpeningId,
      status: nextStatus,
    });
  }

  if (!canUpdate) {
    return (
      <Badge
        variant="secondary"
        className={`rounded-full ${statusStyle.badgeClassName}`}
      >
        <span className={`size-1.5 rounded-full ${statusStyle.dotClassName}`} />
        {status}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        disabled={updateStatusMutation.isPending}
        className="rounded-full"
        aria-label={`Change job opening status, current status: ${status}`}
      >
        <Badge
          variant="secondary"
          className={`rounded-full ${statusStyle.badgeClassName}`}
        >
          <span
            className={`size-1.5 rounded-full ${statusStyle.dotClassName}`}
          />
          {status}
          <ChevronDown className="size-3.5" />
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {Object.values(JobOpeningStatus).map((jobOpeningStatus) => (
          <DropdownMenuItem
            key={jobOpeningStatus}
            onClick={() => handleStatusChange(jobOpeningStatus)}
          >
            <span className="flex-1">{jobOpeningStatus}</span>

            {jobOpeningStatus === status && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
