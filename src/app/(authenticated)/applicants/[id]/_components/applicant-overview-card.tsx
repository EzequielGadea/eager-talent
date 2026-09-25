import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import type { api } from "~/lib/trpc/server";
import { getSafeExternalUrl } from "../_lib/external-url";
import { ApplicantAvatar } from "./applicant-avatar";
import { ApplicantActionsMenu } from "./applicant-actions-menu";

type Applicant = Awaited<ReturnType<typeof api.applicant.getById>>;

type ApplicantOverviewCardProps = {
  applicant: Applicant;
  canShareWithHiringManager: boolean;
  canUpdateApplicant: boolean;
  canDeleteApplicant: boolean;
};

export function ApplicantOverviewCard({
  applicant,
  canShareWithHiringManager,
  canUpdateApplicant,
  canDeleteApplicant,
}: ApplicantOverviewCardProps) {
  const {
    name,
    lastName,
    photo,
    email,
    phone,
    country,
    linkedin,
    source,
    englishLevel,
    role,
    seniority,
  } = applicant;

  const canShowActions = canUpdateApplicant || canDeleteApplicant;
  const linkedinUrl = getSafeExternalUrl(linkedin);
  const linkedinLabel = linkedinUrl
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-70 flex-1 items-start gap-4">
          <div className="shrink-0">
            <ApplicantAvatar name={name} lastName={lastName} photo={photo} />
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle className="wrap-anywhere text-xl font-bold tracking-tight">
              <h1>
                {name} {lastName}
              </h1>
            </CardTitle>

            <CardDescription className="mt-1 wrap-anywhere">
              {role.name}
            </CardDescription>

            <div className="mt-3 flex min-w-0 flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex min-w-0 max-w-full items-center gap-1.5">
                <Mail className="size-4 shrink-0" />
                <span className="min-w-0 wrap-anywhere">
                  {email ?? "Sin email"}
                </span>
              </span>

              <span className="flex min-w-0 max-w-full items-center gap-1.5">
                <Phone className="size-4 shrink-0" />
                <span className="min-w-0 wrap-anywhere">
                  {phone ?? "Sin teléfono"}
                </span>
              </span>

              <span className="flex min-w-0 max-w-full items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                <span className="min-w-0 wrap-anywhere">
                  {country ?? "Sin país"}
                </span>
              </span>

              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 max-w-full items-center gap-1.5 rounded-sm text-text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <FaLinkedin className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 wrap-anywhere">{linkedinLabel}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {(canShareWithHiringManager || canShowActions) && (
          <CardAction className="flex flex-wrap items-center gap-2.5">
            {canShareWithHiringManager && (
              <Button
                variant="outline"
                size="sm"
                className="max-w-full gap-2 rounded-full border-border-strong bg-background px-4 text-xs font-medium text-text-primary shadow-none hover:bg-tag-gray-bg"
              >
                <UserRound className="size-3.5 shrink-0" /> Compartir con un HM
              </Button>
            )}

            {canShowActions && (
              <ApplicantActionsMenu
                canUpdateApplicant={canUpdateApplicant}
                applicant={applicant}
                canDeleteApplicant={canDeleteApplicant}
                defaultShow={false}
              />
            )}
          </CardAction>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ApplicantAttribute label="Rol" value={role.name} />

        <ApplicantAttribute
          label="Seniority"
          value={seniority?.name ?? "Sin seniority"}
        />

        <ApplicantAttribute
          label="Nivel de inglés"
          value={englishLevel ?? "Sin información"}
        />

        <ApplicantAttribute label="Fuente" value={source ?? "Sin fuente"} />
      </CardContent>
    </Card>
  );
}

type ApplicantAttributeProps = {
  label: string;
  value: string;
};

function ApplicantAttribute({ label, value }: ApplicantAttributeProps) {
  return (
    <div className="min-w-0 wrap-anywhere">
      <p className="text-xs font-semibold uppercase text-text-tertiary">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
