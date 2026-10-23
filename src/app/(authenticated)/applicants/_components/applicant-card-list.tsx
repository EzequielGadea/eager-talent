"use client";

import { FileText, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaLinkedin } from "react-icons/fa";

import { Badge } from "~/components/ui/badge";

import type { ApplicantInfo } from "../types";
import { getSourceIcon } from "./source-icon";

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

export function ApplicantCardListFallback() {
  return (
    <div className="flex h-24 items-center justify-center md:hidden">
      <Loader2 className="size-5 animate-spin text-dashboard-text-muted" />
    </div>
  );
}

export function ApplicantCardList({
  applicants,
  isPending,
  emptyMessage,
  isHiringManagerView,
  showSharedBy = false,
}: {
  applicants: ApplicantInfo[];
  isPending: boolean;
  emptyMessage: string;
  isHiringManagerView: boolean;
  showSharedBy?: boolean;
}) {
  if (isPending) {
    return <ApplicantCardListFallback />;
  }

  if (applicants.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-dashboard-text-muted md:hidden">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-dashboard-border md:hidden">
      {applicants.map((applicant) => (
        <li key={applicant.id}>
          {isHiringManagerView ? (
            <HiringManagerApplicantCard
              applicant={applicant}
              showSharedBy={showSharedBy}
            />
          ) : (
            <ApplicantCard applicant={applicant} />
          )}
        </li>
      ))}
    </ul>
  );
}

function ApplicantPhoto({ applicant }: { applicant: ApplicantInfo }) {
  const photoUrl = getSafeExternalUrl(applicant.photo);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  if (photoUrl && photoUrl !== failedPhoto) {
    return (
      <Image
        src={photoUrl}
        alt=""
        width={36}
        height={36}
        unoptimized
        onError={() => setFailedPhoto(photoUrl)}
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${applicant.avatarBg}`}
    >
      {applicant.initials || "-"}
    </div>
  );
}

function CardHeader({ applicant }: { applicant: ApplicantInfo }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ApplicantPhoto applicant={applicant} />

      <div className="min-w-0 flex-1">
        <Link
          href={`/applicants/${applicant.id}`}
          className="block truncate text-sm font-semibold text-dashboard-dark after:absolute after:inset-0"
        >
          {applicant.name || "-"}
        </Link>

        <p className="truncate text-xs text-dashboard-text-muted">
          {applicant.role || "-"}
        </p>
      </div>
    </div>
  );
}

function JobOpeningLine({
  jobOpening,
  showFirst = false,
}: {
  jobOpening: string[];
  showFirst?: boolean;
}) {
  return (
    <p className="flex min-w-0 items-center gap-1 text-xs text-dashboard-text-muted">
      {jobOpening.length > 0 ? (
        <>
          <span className="min-w-0 truncate">
            {jobOpening[showFirst ? 0 : jobOpening.length - 1]}
          </span>
          {jobOpening.length > 1 && (
            <span className="shrink-0 whitespace-nowrap">
              +{jobOpening.length - 1}
            </span>
          )}
        </>
      ) : (
        "Sin vacante"
      )}
    </p>
  );
}

function ApplicantCard({ applicant }: { applicant: ApplicantInfo }) {
  return (
    <article className="relative flex flex-col gap-2.5 px-4 py-3 transition-colors hover:bg-dashboard-success-light">
      <div className="flex items-start justify-between gap-3">
        <CardHeader applicant={applicant} />

        {applicant.seniorityName && (
          <Badge
            variant="secondary"
            style={{
              color: applicant.seniorityColor,
              backgroundColor: `${applicant.seniorityColor}26`,
            }}
            className="shrink-0 whitespace-nowrap rounded-md border-transparent px-2 py-0.5 text-[10px] font-bold leading-4"
          >
            {applicant.seniorityName}
          </Badge>
        )}
      </div>

      <JobOpeningLine jobOpening={applicant.jobOpening} />

      {applicant.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {applicant.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              style={{
                color: tag.color,
                backgroundColor: `${tag.color}26`,
              }}
              className="whitespace-nowrap rounded-full border-transparent px-2 py-0.5 text-[10px] font-semibold leading-4"
            >
              {tag.label || "-"}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-dashboard-text-muted">
          {applicant.source && (
            <span className="shrink-0">
              {getSourceIcon(applicant.source)}
            </span>
          )}

          <span className="truncate">
            {[applicant.area, applicant.source].filter(Boolean).join(" · ")}
          </span>
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-1">
          {applicant.hasCv && applicant.cvUrl && (
            <a
              href={applicant.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Descargar CV"
              className="inline-flex size-8 items-center justify-center rounded-md text-dashboard-text-muted transition-colors hover:bg-dashboard-track hover:text-dashboard-dark"
            >
              <FileText size={15} />
            </a>
          )}

          {applicant.hasLinkedin && applicant.linkedinUrl && (
            <a
              href={applicant.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver perfil de LinkedIn"
              className="inline-flex size-8 items-center justify-center rounded-md text-[#0a66c2] transition-colors hover:bg-dashboard-track hover:text-[#004182]"
            >
              <FaLinkedin size={15} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function HiringManagerApplicantCard({
  applicant,
  showSharedBy,
}: {
  applicant: ApplicantInfo;
  showSharedBy: boolean;
}) {
  return (
    <article className="relative flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-dashboard-success-light">
      <CardHeader applicant={applicant} />

      <JobOpeningLine jobOpening={applicant.jobOpening} showFirst />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {applicant.currentStage ? (
          <span className="inline-flex rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-semibold text-text-secondary">
            {applicant.currentStage}
          </span>
        ) : applicant.viewedAt ? (
          <span className="inline-flex rounded-full bg-tag-green-bg px-2.5 py-1 text-xs font-semibold text-tag-green-fg">
            Visto
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-tag-purple-bg px-2.5 py-1 text-xs font-semibold text-tag-purple-fg">
            Compartido para revisar
          </span>
        )}

        {showSharedBy && (
          <span className="truncate text-xs text-dashboard-text-muted">
            Enviado por {applicant.sharedBy ?? "-"}
          </span>
        )}
      </div>
    </article>
  );
}
