import {
  Mail,
  MapPin,
  Phone,
  UserRound,
  MoreHorizontal,
  Pencil,
  Briefcase,
  Trash2,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import type { api } from "~/lib/trpc/server";
import { englishLevelLabels, sourceLabels } from "../_lib/candidate-labels";
import { getSafeExternalUrl } from "../_lib/external-url";
import { CandidateAvatar } from "./candidate-avatar";

type CandidatePromise = Promise<
  Awaited<ReturnType<typeof api.candidate.getById>>
>;
type CandidateOverviewCardProps = { candidatePromise: CandidatePromise };

export async function CandidateOverviewCard({
  candidatePromise,
}: CandidateOverviewCardProps) {
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
  } = await candidatePromise;
  const linkedinUrl = getSafeExternalUrl(linkedin);
  const linkedinLabel = linkedinUrl
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex gap-4 items-start justify-between">
          <CandidateAvatar name={name} lastName={lastName} photo={photo} />

          <div className="min-w-0 flex-1">
            <CardTitle className="wrap-anywhere text-xl font-bold tracking-tight">
              <h1>
                {name} {lastName}
              </h1>
            </CardTitle>

            <CardDescription className="mt-1 wrap-anywhere">
              {role.name}
            </CardDescription>

            <div className="mt-3 flex flex-col gap-y-2 text-sm text-muted-foreground">
              <span className="flex min-w-0 max-w-full items-center gap-1.5">
                <Mail className="size-4 shrink-0" />
                <span className="min-w-0 wrap-anywhere">
                  {email ?? "Sin email"}
                </span>
                <Phone className="ml-3 size-4 shrink-0" />
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

          <div className="flex shrink-0 items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-border-strong bg-background px-4 text-xs font-medium text-text-primary shadow-none hover:bg-tag-gray-bg"
            >
              <UserRound className="h-3.5 w-3.5" /> Compartir con un HM
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 rounded-lg hover:bg-muted"
                  />
                }
              >
                <MoreHorizontal className="h-4 w-4 text-text-tertiary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem className="gap-2">
                  <Pencil className="h-4 w-4" />
                  <span>Editar datos del candidato</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Postular a una vacante</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={cn(
                    "gap-2 text-danger hover:bg-danger-bg hover:text-tag-red-fg",
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar candidato</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CandidateAttribute label="Rol" value={role.name} />

        <CandidateAttribute
          label="Seniority"
          value={seniority?.name ?? "Sin seniority"}
        />

        <CandidateAttribute
          label="Nivel de inglés"
          value={
            englishLevel ? englishLevelLabels[englishLevel] : "Sin información"
          }
        />

        <CandidateAttribute
          label="Fuente"
          value={source ? sourceLabels[source] : "Sin fuente"}
        />
      </CardContent>
    </Card>
  );
}

type CandidateAttributeProps = {
  label: string;
  value: string;
};

function CandidateAttribute({ label, value }: CandidateAttributeProps) {
  return (
    <div className="min-w-0 wrap-anywhere">
      <p className="text-xs font-semibold uppercase text-text-tertiary">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
