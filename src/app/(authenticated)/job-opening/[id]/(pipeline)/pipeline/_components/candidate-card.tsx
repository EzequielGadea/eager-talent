"use client";

import {
  ArrowRight,
  CalendarDays,
  CircleX,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/lib/trpc/react";

import { useDraggable } from "@dnd-kit/core";
import type { PipelineCandidate } from "./types";
import { useState } from "react";
import { ScheduleInterviewDialog } from "~/app/(authenticated)/job-opening/[id]/(pipeline)/pipeline/_components/schedule-interwiev-dialog";
import { format, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";

function formatInterviewLabel(date: Date) {
  if (isToday(date)) {
    return `Hoy ${format(date, "HH:mm")}`;
  }

  if (isTomorrow(date)) {
    return `Mañana ${format(date, "HH:mm")}`;
  }

  const label = format(date, "EEEE HH:mm", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

type CandidateCardProps = {
  candidate: PipelineCandidate;
  jobOpeningId: string;
  currentStage: string;
  onAdvanced: (applicantId: string) => void;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
};

export function CandidateCard({
  candidate,
  jobOpeningId,
  currentStage,
  onAdvanced,
  canUpdateApplication,
  canCreateInterview,
}: CandidateCardProps) {
  const router = useRouter();
  const [isScheduleInterviewDialogOpen, setIsScheduleInterviewDialogOpen] =
    useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.applicantId,
  });

  const advanceApplicationStageMutation =
    api.application.advanceApplicationStage.useMutation({
      onSuccess: () => {
        onAdvanced(candidate.applicantId);
        router.refresh();
      },
      onError: (error) => {
        console.error("Error al avanzar etapa:", error);
      },
    });

  const handleViewProfile = () => {
    router.push(`/applicants/${candidate.applicantId}`);
  };

  const handleAdvanceStage = () => {
    if (!canUpdateApplication) {
      return;
    }

    advanceApplicationStageMutation.mutate({
      applicantId: candidate.applicantId,
      jobOpeningId,
      currentStage,
    });
  };

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

  const initials =
    `${candidate.name.charAt(0)}${candidate.lastName.charAt(0)}`.toUpperCase();

  const avatarColor = getAvatarColor(candidate.applicantId);

  return (
    <>
      <Card
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        }}
        className="cursor-grab rounded-xl border-border-default bg-card p-3 shadow-none active:cursor-grabbing"
      >
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarImage
              src={candidate.photo ?? undefined}
              alt={`${candidate.name} ${candidate.lastName}`}
            />

            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {candidate.name} {candidate.lastName}
            </p>

            {/*candidate.role && (
              <p className="truncate text-xs text-text-secondary">
                {candidate.role}
              </p>
            )}*/}

            {candidate.nextInterview && (
              <p className="truncate text-xs font-medium text-dashboard-sky-text">
                Entrevista ·{" "}
                {formatInterviewLabel(new Date(candidate.nextInterview.date))}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-accent hover:text-text-primary"
              aria-label={`Acciones para ${candidate.name} ${candidate.lastName}`}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <DropdownMenuItem onClick={handleViewProfile}>
                <UserRound className="size-4" />
                <span>Ver perfil</span>
              </DropdownMenuItem>

              {canUpdateApplication && (
                <DropdownMenuItem
                  onClick={handleAdvanceStage}
                  disabled={advanceApplicationStageMutation.isPending}
                >
                  <ArrowRight className="size-4" />
                  <span>
                    {advanceApplicationStageMutation.isPending
                      ? "Avanzando..."
                      : "Avanzar etapa"}
                  </span>
                </DropdownMenuItem>
              )}

              {canCreateInterview && (
                <DropdownMenuItem
                  onClick={() => setIsScheduleInterviewDialogOpen(true)}
                >
                  <CalendarDays className="size-4" />
                  <span>Agregar entrevista</span>
                </DropdownMenuItem>
              )}

              {canUpdateApplication && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <CircleX className="size-4" />
                    <span>Descalificar candidato</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {canCreateInterview && (
        <ScheduleInterviewDialog
          open={isScheduleInterviewDialogOpen}
          onOpenChange={setIsScheduleInterviewDialogOpen}
          applicantId={candidate.applicantId}
          jobOpeningId={jobOpeningId}
          candidateName={`${candidate.name} ${candidate.lastName}`}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
