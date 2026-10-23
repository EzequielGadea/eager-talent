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
import { interviewTypeTranslations } from "~/lib/enum-translations";

import type { PipelineCandidate } from "./types";
import { ScheduleInterviewDialog } from "~/app/(authenticated)/job-openings/[id]/(pipeline)/pipeline/_components/schedule-interview-dialog";
import { DisqualifyCandidateDialog } from "./disqualify-candidate-dialog";

import getAvatar from "~/lib/avatar";

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
  currentStageId: string;
  currentStageName: string;
  isLastStage: boolean;
  onAdvancedAction: (applicantId: string) => void;
  canUpdateApplication: boolean;
  canCreateInterview: boolean;
  canDeleteInterview: boolean;
};

export function CandidateCard({
  candidate,
  jobOpeningId,
  currentStageId,
  currentStageName,
  isLastStage,
  onAdvancedAction,
  canUpdateApplication,
  canCreateInterview,
  canDeleteInterview,
}: CandidateCardProps) {
  const router = useRouter();

  const [isDisqualifyDialogOpen, setIsDisqualifyDialogOpen] = useState(false);
  const [isScheduleInterviewDialogOpen, setIsScheduleInterviewDialogOpen] =
    useState(false);
  const [isInterviewsDialogOpen, setIsInterviewsDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.applicantId,
    data: { candidate, stageId: currentStageId },
    disabled: !canUpdateApplication,
  });

  const dragProps = canUpdateApplication ? { ...listeners, ...attributes } : {};

  const advanceApplicationStageMutation =
    api.application.advanceApplicationStage.useMutation({
      onSuccess: () => {
        onAdvancedAction(candidate.applicantId);
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

      setInterviewToDelete(null);
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
      currentStageId,
    });
  };

  const avatar = getAvatar(candidate.name, candidate.lastName);

  const initials = avatar.initials;
  const avatarColor = avatar.colorClass;

  return (
    <>
      <Card
        ref={setNodeRef}
        data-pipeline-candidate
        {...dragProps}
        style={{
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        }}
        className={`rounded-xl border-border-default bg-card p-3 shadow-none ${
          canUpdateApplication ? "cursor-grab" : ""
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
                      {interviewTypeTranslations[interview.modality]} ·{" "}
                      {interview.duration} min
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
                      onClick={() =>
                        setInterviewToDelete({
                          id: interview.id,
                          name: interview.name,
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      )}

      {canDeleteInterview && (
        <Dialog
          open={interviewToDelete !== null}
          onOpenChange={(open) => {
            if (!open && !deleteInterviewMutation.isPending) {
              setInterviewToDelete(null);
            }
          }}
        >
          <DialogContent className="w-full max-w-md">
            <DialogTitle className="text-lg font-semibold text-text-primary">
              ¿Eliminar entrevista?
            </DialogTitle>

            <DialogDescription className="text-sm text-text-secondary">
              Vas a eliminar la entrevista “{interviewToDelete?.name}” de{" "}
              {candidate.name} {candidate.lastName}. Esta acción no se puede
              deshacer.
            </DialogDescription>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={deleteInterviewMutation.isPending}
                onClick={() => setInterviewToDelete(null)}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={deleteInterviewMutation.isPending}
                onClick={() => {
                  if (interviewToDelete) {
                    deleteInterviewMutation.mutate({
                      interviewId: interviewToDelete.id,
                    });
                  }
                }}
              >
                {deleteInterviewMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Sí, eliminar"
                )}
              </Button>
            </div>
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
          stageName={currentStageName}
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
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
