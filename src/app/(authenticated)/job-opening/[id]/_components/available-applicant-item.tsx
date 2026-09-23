import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import type { AvailableApplicant } from "./add-applicant-types";

type AvailableApplicantItemProps = {
  applicant: AvailableApplicant;
  onSelect: (applicant: AvailableApplicant) => void;
};

function getInitials(applicant: AvailableApplicant) {
  return `${applicant.name.charAt(0)}${applicant.lastName.charAt(0)}`.toUpperCase();
}

export function AvailableApplicantItem({
  applicant,
  onSelect,
}: AvailableApplicantItemProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-accent"
      onClick={() => onSelect(applicant)}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarImage
          src={applicant.photo ?? undefined}
          alt={`${applicant.name} ${applicant.lastName}`}
        />

        <AvatarFallback className="bg-muted text-muted-foreground">
          {getInitials(applicant)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {applicant.name} {applicant.lastName}
        </p>

        <p className="truncate text-xs text-text-secondary">
          {applicant.email}
        </p>

        {applicant.role.name && (
          <p className="truncate text-xs text-text-tertiary">
            {applicant.role.name}
          </p>
        )}
      </div>
    </button>
  );
}