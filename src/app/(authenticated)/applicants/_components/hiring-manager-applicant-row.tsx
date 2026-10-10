"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TableCell, TableRow } from "~/components/ui/table";

import type { ApplicantInfo } from "../types";

function getSafeExternalUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function HiringManagerApplicantRow({
  applicant,
  showSharedBy,
}: {
  applicant: ApplicantInfo;
  showSharedBy: boolean;
}) {
  const router = useRouter();
  const photoUrl = getSafeExternalUrl(applicant.photo);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  const hasJobOpening = applicant.jobOpening.length > 0;

  return (
    <TableRow
      onClick={() => router.push(`/applicants/${applicant.id}`)}
      className="group cursor-pointer border-b border-dashboard-border transition-colors hover:bg-dashboard-success-light last:border-0"
    >
      <TableCell className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {photoUrl && photoUrl !== failedPhoto ? (
            <Image
              src={photoUrl}
              alt={applicant.name}
              width={36}
              height={36}
              unoptimized
              onError={() => setFailedPhoto(photoUrl)}
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${applicant.avatarBg}`}
            >
              {applicant.initials}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-dashboard-dark">
              {applicant.name}
            </p>

            <p className="truncate text-xs text-dashboard-text-muted">
              {applicant.role}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3">
        {hasJobOpening ? (
          <div className="text-sm text-dashboard-text-muted">
            <span>{applicant.jobOpening[0]}</span>

            {applicant.jobOpening.length > 1 && (
              <span className="ml-1 text-xs">
                +{applicant.jobOpening.length - 1}
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-dashboard-text-muted">Sin vacante</span>
        )}
      </TableCell>

      <TableCell className="px-4 py-3">
        {applicant.currentStage ? (
          <span className="...">{applicant.currentStage}</span>
        ) : applicant.viewedAt ? (
          <span className="inline-flex rounded-full bg-tag-green-bg px-2.5 py-1 text-xs font-semibold text-tag-green-fg">
            Visto
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-tag-purple-bg px-2.5 py-1 text-xs font-semibold text-tag-purple-fg">
            Compartido para revisar
          </span>
        )}
      </TableCell>

      {showSharedBy && <TableCell>{applicant.sharedBy ?? "-"}</TableCell>}
    </TableRow>
  );
}
