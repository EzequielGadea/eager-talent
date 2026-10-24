"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "~/components/ui/toast";
import { JobOpeningStatus } from "~/generated/prisma/enums";
import { jobOpeningStatusTranslations } from "~/lib/enum-translations";
import { api } from "~/lib/trpc/react";

type JobOpeningStatusDropdownProps = {
  jobOpeningId: string;
  status: JobOpeningStatus;
  canUpdate: boolean;
};

type TerminalStatus =
  | typeof JobOpeningStatus.Closed
  | typeof JobOpeningStatus.Cancelled;

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

function isTerminalStatus(
  value: JobOpeningStatus,
): value is TerminalStatus {
  return (
    value === JobOpeningStatus.Closed || value === JobOpeningStatus.Cancelled
  );
}

export function JobOpeningStatusDropdown({
  jobOpeningId,
  status,
  canUpdate,
}: JobOpeningStatusDropdownProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingConfirmationStatus, setPendingConfirmationStatus] =
    useState<TerminalStatus>(JobOpeningStatus.Closed);

  const updateStatusMutation = api.jobOpening.updateStatus.useMutation({
    onSuccess: () => {
      startTransition(() => {
        setIsConfirmOpen(false);
        router.refresh();
      });
    },
    onError: (error) => {
      toast.add({
        title: error.message,
        type: "error",
      });
    },
  });

  const isBusy = updateStatusMutation.isPending || isRefreshing;
  const statusStyle = statusStyles[status] ?? fallbackStatusStyle;
  const isLocked = isTerminalStatus(status);

  function handleStatusChange(nextStatus: JobOpeningStatus) {
    if (nextStatus === status || isBusy || isLocked) {
      return;
    }

    if (isTerminalStatus(nextStatus)) {
      setPendingConfirmationStatus(nextStatus);
      setIsConfirmOpen(true);
      return;
    }

    updateStatusMutation.mutate({
      jobOpeningId,
      status: nextStatus,
    });
  }

  function handleConfirmTerminalStatus() {
    if (!isConfirmOpen || isBusy) {
      return;
    }

    updateStatusMutation.mutate({
      jobOpeningId,
      status: pendingConfirmationStatus,
    });
  }

  if (!canUpdate || isLocked) {
    return (
      <Badge
        variant="secondary"
        className={`rounded-full ${statusStyle.badgeClassName}`}
      >
        <span className={`size-1.5 rounded-full ${statusStyle.dotClassName}`} />
        {jobOpeningStatusTranslations[status]}
      </Badge>
    );
  }

  const isClosing = pendingConfirmationStatus === JobOpeningStatus.Closed;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          disabled={isBusy}
          className="rounded-full"
          aria-label={`Cambiar el estado de la vacante, estado actual: ${jobOpeningStatusTranslations[status]}`}
        >
          <Badge
            variant="secondary"
            className={`rounded-full ${statusStyle.badgeClassName}`}
          >
            <span
              className={`size-1.5 rounded-full ${statusStyle.dotClassName}`}
            />
            {jobOpeningStatusTranslations[status]}
            <ChevronDown className="size-3.5" />
          </Badge>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          {Object.values(JobOpeningStatus).map((jobOpeningStatus) => (
            <DropdownMenuItem
              key={jobOpeningStatus}
              onClick={() => handleStatusChange(jobOpeningStatus)}
            >
              <span className="flex-1">
                {jobOpeningStatusTranslations[jobOpeningStatus]}
              </span>

              {jobOpeningStatus === status && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !isBusy) {
            setIsConfirmOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isClosing
                ? "¿Pasar la vacante a Cerrada?"
                : "¿Pasar la vacante a Cancelada?"}
            </DialogTitle>
            <DialogDescription>
              Una vez que confirmes el cambio a{" "}
              <span className="font-semibold text-text-primary">
                {isClosing ? "Cerrada" : "Cancelada"}
              </span>
              , no se podrá volver a modificar el estado ni editar los datos de
              esta vacante.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => setIsConfirmOpen(false)}
            >
              Volver
            </Button>
            <Button
              type="button"
              disabled={isBusy}
              onClick={handleConfirmTerminalStatus}
            >
              {isBusy
                ? "Confirmando..."
                : isClosing
                  ? "Cerrar vacante"
                  : "Cancelar vacante"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
