import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

import type { EnglishLevel, JobOpeningStatus } from "~/generated/prisma/enums";
import { englishLevelTranslations } from "~/lib/enum-translations";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { getApplicationStatusBadge } from "../utils";
import { PublicAttribute } from "./public-attribute";

type PublicCandidateCardProps = {
  name: string;
  lastName: string;
  photo?: string | null;
  roleName?: string | null;
  seniorityName?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  englishLevel?: EnglishLevel | null;
  title?: string | null;
  academicInstitution?: string | null;
  active?: boolean;
  jobOpeningStatus?: JobOpeningStatus;
};

export function PublicCandidateCard({
  name,
  lastName,
  photo,
  roleName,
  seniorityName,
  email,
  phone,
  country,
  englishLevel,
  title,
  academicInstitution,
  active = true,
  jobOpeningStatus = "Open",
}: PublicCandidateCardProps) {
  const initials = `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fullName = `${name} ${lastName}`;
  const formation = [title, academicInstitution].filter(Boolean).join(" · ");
  const status = getApplicationStatusBadge(active, jobOpeningStatus);

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-col gap-4 pb-2">
        <div className="flex items-start gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-tag-green-bg text-h2 text-tag-green-fg">
            {photo ? (
              <Image
                src={photo}
                alt={fullName}
                width={80}
                height={80}
                className="size-20 object-cover"
                unoptimized
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle className="text-h2 text-text-primary">
              {fullName}
            </CardTitle>

            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.badgeClass}`}
              >
                <span className={`size-1.5 rounded-full ${status.dotClass}`} />
                {status.label}
              </span>

              {(roleName || seniorityName) && (
                <span className="text-sm font-medium text-text-secondary">
                  {[roleName, seniorityName].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
              {email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="size-4 shrink-0 text-text-tertiary" />
                  <span>{email}</span>
                </span>
              )}

              {phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-4 shrink-0 text-text-tertiary" />
                  <span>{phone}</span>
                </span>
              )}

              {country && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0 text-text-tertiary" />
                  <span>{country}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
        <PublicAttribute label="Seniority" value={seniorityName} />

        <PublicAttribute
          label="Nivel de inglés"
          value={englishLevel ? englishLevelTranslations[englishLevel] : null}
        />

        <PublicAttribute label="Formación" value={formation} />
      </CardContent>
    </Card>
  );
}
