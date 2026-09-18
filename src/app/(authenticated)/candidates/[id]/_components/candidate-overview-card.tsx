import { Mail, MapPin, Phone } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { CandidatePromise } from "../types";
import { englishLevelLabels, sourceLabels } from "../_lib/candidate-labels";
import { getSafeExternalUrl } from "../_lib/external-url";
import { CandidateAvatar } from "./candidate-avatar";

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
        <div className="flex gap-4">
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

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
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
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                    className="size-3.5 shrink-0"
                  >
                    <path d="M20.45 2H3.55C2.7 2 2 2.68 2 3.52v16.96C2 21.32 2.7 22 3.55 22h16.9c.85 0 1.55-.68 1.55-1.52V3.52C22 2.68 21.3 2 20.45 2ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.5V9.2h2.84v1.3h.04a3.11 3.11 0 0 1 2.8-1.54c2.99 0 3.55 1.97 3.55 4.52v5.27Z" />
                  </svg>
                  <span className="min-w-0 wrap-anywhere">{linkedinLabel}</span>
                </a>
              )}
            </div>
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
