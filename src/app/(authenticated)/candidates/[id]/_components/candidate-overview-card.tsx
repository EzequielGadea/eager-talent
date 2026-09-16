import { Link, Mail, MapPin, Phone } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { getCandidate } from "../_lib/get-candidate";
import { englishLevelLabels, sourceLabels } from "../_lib/candidate-labels";
import { getSafeExternalUrl } from "../_lib/external-url";
import { CandidateAvatar } from "./candidate-avatar";

type CandidateOverviewCardProps = { candidateId: string };

export async function CandidateOverviewCard({
  candidateId,
}: CandidateOverviewCardProps) {
  const {
    name,
    lastName,
    photo,
    email,
    phone,
    country,
    linkedin,
    title,
    source,
    englishLevel,
    role,
    seniority,
  } = await getCandidate(candidateId);
  const linkedinUrl = getSafeExternalUrl(linkedin);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex gap-4">
          <CandidateAvatar name={name} lastName={lastName} photo={photo} />

          <div className="min-w-0 flex-1">
            <CardTitle className="wrap-anywhere">
              <h1>
                {name} {lastName}
              </h1>
            </CardTitle>

            <CardDescription className="mt-1 wrap-anywhere">
              {title ?? "Sin título"}
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
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <Link className="size-4 shrink-0" />
                  LinkedIn
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
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
