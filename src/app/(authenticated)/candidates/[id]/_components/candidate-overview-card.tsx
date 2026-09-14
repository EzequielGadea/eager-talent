import { Link, Mail, MapPin, Phone } from "lucide-react";
import type { EnglishLevel, Source } from "~/generated/prisma/enums";
import { englishLevelLabels, sourceLabels } from "../_lib/candidate-labels";
import { getSafeExternalUrl } from "../_lib/external-url";
import { CandidateAvatar } from "./candidate-avatar";

type CandidateOverviewCardProps = {
  name: string;
  lastName: string;
  photo: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  linkedin: string | null;
  title: string | null;
  source: Source | null;
  englishLevel: EnglishLevel | null;

  role: {
    name: string;
  };
  seniority: {
    name: string;
  } | null;
};

export function CandidateOverviewCard({
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
}: CandidateOverviewCardProps) {
  const linkedinUrl = getSafeExternalUrl(linkedin);

  return (
    <section className="rounded-xl border bg-white p-5">
      <div className="flex gap-4">
        <CandidateAvatar name={name} lastName={lastName} photo={photo} />

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold">
            {name} {lastName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {title ?? "Sin título"}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 shrink-0" />
              {email ?? "Sin email"}
            </span>

            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 shrink-0" />
              {phone ?? "Sin teléfono"}
            </span>

            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              {country ?? "Sin país"}
            </span>

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:underline"
              >
                <Link className="h-4 w-4 shrink-0" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}

type CandidateAttributeProps = {
  label: string;
  value: string;
};

function CandidateAttribute({ label, value }: CandidateAttributeProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
