"use client";

import { CircleAlert, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/lib/trpc/react";
import type { DisqualifiedApplication } from "../types";

const avatarColors = [
  "bg-dashboard-orange-light text-dashboard-orange-text",
  "bg-dashboard-sky-avatar text-dashboard-sky-text",
  "bg-dashboard-success-avatar text-dashboard-success-text",
  "bg-tag-gray-bg text-tag-gray-fg",
  "bg-tag-blue-bg text-tag-blue-fg",
  "bg-dashboard-purple-avatar text-dashboard-purple-text",
  "bg-tag-amber-bg text-tag-amber-fg",
];

function getAvatarColor(id: string) {
  const hash = id
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return avatarColors[hash % avatarColors.length];
}

type DisqualifiedCardProps = {
  application: DisqualifiedApplication;
  jobOpeningId: string;
  canRequalify: boolean;
};

export function DisqualifiedCard({
  application,
  jobOpeningId,
  canRequalify,
}: DisqualifiedCardProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const requalifyMutation = api.application.requalifyApplication.useMutation({
    onSuccess: () => {
      setIsConfirmOpen(false);
      router.refresh();
    },
  });

  const disqualifiedAt = new Date(application.disqualificationDate);

  const fullName = `${application.name} ${application.lastName}`;
  const initials =
    `${application.name.charAt(0)}${application.lastName.charAt(0)}`.toUpperCase();

  return (
    <>
      {/* Borde izquierdo rojo: marca visual de que fue descartado. */}
      <Card className="gap-0 rounded-xl border-border-default border-l-4 border-l-destructive bg-card p-3 shadow-none">
        <Link
          href={`/applicants/${application.applicantId}`}
          className="flex items-center gap-3"
        >
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={application.photo ?? undefined} alt={fullName} />
            <AvatarFallback className={getAvatarColor(application.applicantId)}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {fullName}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {application.role}
            </p>
          </div>
        </Link>

        {/* Separador, motivo en rojo y tiempo transcurrido. */}
        <div className="mt-3 flex flex-col gap-1 border-t border-border-default pt-3">
          {application.disqualificationReason && (
            <p className="flex items-start gap-1.5 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-2">
                {application.disqualificationReason}
              </span>
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            {/* la fecha exacta al pasar el mouse. */}
            <p
              className="text-xs text-text-secondary"
              title={format(disqualifiedAt, "d 'de' MMMM yyyy · HH:mm", {
                locale: es,
              })}
            >
              Descartado{" "}
              {formatDistanceToNow(disqualifiedAt, {
                locale: es,
                addSuffix: true,
              })}
            </p>

            {canRequalify && (
              <Button
                type="button"
                variant="outline"
                className="h-7 shrink-0 rounded-full px-3 text-xs"
                onClick={() => setIsConfirmOpen(true)}
              >
                <RotateCcw className="size-3" />
                Volver a calificar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {canRequalify && (
        <Dialog
          open={isConfirmOpen}
          onOpenChange={(nextOpen) => {
            setIsConfirmOpen(nextOpen);

            if (!nextOpen) {
              requalifyMutation.reset();
            }
          }}
        >
          <DialogContent className="w-full max-w-md gap-0 overflow-hidden p-0">
            <div className="px-6 py-5">
              <DialogTitle className="text-lg font-semibold text-text-primary">
                Volver a calificar
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-text-secondary">
                {fullName} vuelve al pipeline en la etapa «{application.stage}»
                y se elimina el motivo de descarte.
              </DialogDescription>

              {requalifyMutation.isError && (
                <p className="mt-3 text-sm text-danger">
                  {requalifyMutation.error.data?.code === "CONFLICT"
                    ? requalifyMutation.error.message
                    : "No se pudo volver a calificar la postulación."}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border-default bg-slate-50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-5"
                onClick={() => setIsConfirmOpen(false)}
                disabled={requalifyMutation.isPending}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
                disabled={requalifyMutation.isPending}
                onClick={() =>
                  requalifyMutation.mutate({
                    applicantId: application.applicantId,
                    jobOpeningId,
                  })
                }
              >
                {requalifyMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
