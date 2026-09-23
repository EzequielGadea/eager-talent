"use client";

import { ArrowRight, CalendarDays, CircleX, MoreHorizontal, UserRound } from "lucide-react";
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

import type { PipelineCandidate } from "./types";

type CandidateCardProps = {
  candidate: PipelineCandidate;
};

export function CandidateCard({ candidate }: CandidateCardProps) {
  const router = useRouter();
  const handleViewProfile = () => {
    router.push(`/applicants/${candidate.applicantId}`);
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
    const hash = id.split("").reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    );

    return avatarColors[hash % avatarColors.length];
  }
  const initials = `${candidate.name.charAt(0)}${candidate.lastName.charAt(0)}`.toUpperCase();
  const avatarColor = getAvatarColor(candidate.applicantId);

  return (
    <Card className="rounded-xl border-border-default bg-card p-3 shadow-none">
      <div className="flex items-center gap-3">
        <Avatar className="size-9 shrink-0">
          <AvatarImage
            src={candidate.photo ?? undefined}
            alt={`${candidate.name} ${candidate.lastName}`}
          />
          <AvatarFallback className={avatarColor}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">
            {candidate.name} {candidate.lastName}
          </p>

          {candidate.role && (
            <p className="truncate text-xs text-text-secondary">
              {candidate.role}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-accent hover:text-text-primary"
            aria-label={`Acciones para ${candidate.name} ${candidate.lastName}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={handleViewProfile}>
              <UserRound className="size-4" />
              <span>Ver perfil</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <ArrowRight className="size-4" />
              <span>Avanzar etapa</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <CalendarDays className="size-4" />
              <span>Agregar entrevista</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <CircleX className="size-4" />
              <span>Descalificar candidato</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}