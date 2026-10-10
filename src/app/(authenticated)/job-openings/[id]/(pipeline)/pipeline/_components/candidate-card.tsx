"use client";

import {
  ArrowRight,
  CalendarDays,
  CircleX,
  Loader2,
  MoreHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";

import { useDraggable } from "@dnd-kit/core";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/lib/trpc/react";

import type { PipelineCandidate } from "./types";
import { ScheduleInterviewDialog } from "~/app/(authenticated)/job-openings/[id]/(pipeline)/pipeline/_components/schedule-interview-dialog";
import { DisqualifyCandidateDialog } from "./disqualify-candidate-dialog";

const modalityLabels: Record<string, string> = {
  VideoCall: "Videollamada",
  InPerson: "Presencial",
};

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

function formatInterviewDateTime(date: Date) {
  const label = format(date, "EEEE d 'de' MMMM · HH:mm", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

type CandidateCardProps = {
  candidate: PipelineCandidate;
  jobOpeningId: string;
  currentStage: string;
  isLastStage: boolean;
  onAdvanced: (applicantId: string) => void;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
  canDeleteInterview: boolean;
};

export function CandidateCard({
  candidate,
  jobOpeningId,
  currentStage,
  isLastStage,
  onAdvanced,
  canUpdateApplication,
  canCreateInterview,
  canDeleteInterview,
}: CandidateCardProps) {
  const router = useRouter();

  const [isDisqualifyDialogOpen, setIsDisqualifyDialogOpen] = useState(false);
  const [isScheduleInterviewDialogOpen, setIsScheduleInterviewDialogOpen] =
    useState(false);
  const [isInterviewsDialogOpen, setIsInterviewsDialogOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.applicantId,
    data: { candidate, stage: currentStage },
    disabled: !canUpdateApplication,
  });

  const dragProps = canUpdateApplication ? { ...listeners, ...attributes } : {};

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

  const deleteInterviewMutation = api.interview.delete.useMutation({
    onSuccess: () => {
      if (candidate.scheduledInterviews.length <= 1) {
        setIsInterviewsDialogOpen(false);
      }

      router.refresh();
    },
    onError: (error) => {
      console.error("Error al eliminar la entrevista:", error);
    },
  });

  const handleViewProfile = () => {
    router.push(`/applicants/${candidate.applicantId}`);
  };

  const handleAdvanceStage = () => {
    if (!canUpdateApplication || isLastStage) {
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
        {...dragProps}
        style={{
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        }}
        className={`rounded-xl border-border-default bg-card p-3 shadow-none ${
          canUpdateApplication ? "cursor-grab active:cursor-grabbing" : ""
        }`}
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

            {candidate.nextInterview && (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setIsInterviewsDialogOpen(true)}
                className="flex max-w-full items-center gap-1 text-left text-xs font-medium text-dashboard-sky-text underline-offset-2 hover:underline"
              >
                <span className="truncate">
                  Entrevista ·{" "}
                  {formatInterviewLabel(new Date(candidate.nextInterview.date))}
                </span>

                {candidate.scheduledInterviews.length > 1 && (
                  <span className="shrink-0">
                    · +{candidate.scheduledInterviews.length - 1} más
                  </span>
                )}
              </button>
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

              {canUpdateApplication && !isLastStage && (
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

                  <DropdownMenuItem
                    onClick={() => setIsDisqualifyDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <CircleX className="size-4" />
                    <span>Descalificar candidato</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {candidate.scheduledInterviews.length > 0 && (
        <Dialog
          open={isInterviewsDialogOpen}
          onOpenChange={setIsInterviewsDialogOpen}
        >
          <DialogContent className="w-full max-w-lg gap-0 overflow-hidden p-0">
            <div className="border-b border-border-default px-6 py-5">
              <DialogTitle className="text-lg font-semibold text-text-primary">
                {candidate.scheduledInterviews.length > 1
                  ? "Entrevistas agendadas"
                  : "Entrevista agendada"}
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-text-secondary">
                {candidate.name} {candidate.lastName}
              </DialogDescription>
            </div>

            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto px-6 py-5">
              {candidate.scheduledInterviews.map((interview) => (
                <li
                  key={interview.id}
                  className="flex items-start gap-3 rounded-lg border border-border-default p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {interview.name}
                    </p>

                    <p className="text-xs text-text-secondary">
                      {formatInterviewDateTime(new Date(interview.date))}
                    </p>

                    <p className="text-xs text-text-secondary">
                      {modalityLabels[interview.modality] ?? interview.modality}{" "}
                      · {interview.duration} min
                    </p>

                    {interview.interviewers.length > 0 && (
                      <p className="mt-1 text-xs text-text-secondary">
                        Entrevistadores:{" "}
                        {interview.interviewers
                          .map(
                            (interviewer) =>
                              `${interviewer.name} ${interviewer.lastName}`,
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  {canDeleteInterview && (
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={`Eliminar entrevista ${interview.name}`}
                      className="size-8 shrink-0 p-0 text-text-secondary hover:text-destructive"
                      disabled={deleteInterviewMutation.isPending}
                      onClick={() =>
                        deleteInterviewMutation.mutate({
                          interviewId: interview.id,
                        })
                      }
                    >
                      {deleteInterviewMutation.isPending &&
                      deleteInterviewMutation.variables?.interviewId ===
                        interview.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      )}

      {canUpdateApplication && (
        <DisqualifyCandidateDialog
          open={isDisqualifyDialogOpen}
          onOpenChange={setIsDisqualifyDialogOpen}
          applicantId={candidate.applicantId}
          jobOpeningId={jobOpeningId}
          candidateName={`${candidate.name} ${candidate.lastName}`}
          candidateRole={candidate.role}
          stageName={currentStage}
          onSuccess={() => router.refresh()}
        />
      )}

      {canCreateInterview && (
        <ScheduleInterviewDialog
          open={isScheduleInterviewDialogOpen}
          onOpenChange={setIsScheduleInterviewDialogOpen}
          applicantId={candidate.applicantId}
          jobOpeningId={jobOpeningId}
          candidateName={`${candidate.name} ${candidate.lastName}`}
          stageName={currentStage}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
