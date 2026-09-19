"use client";

import { FileText } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { TableCell, TableRow } from "~/components/ui/table";
import { useState } from "react";
import Image from "next/image";

import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { ApplicantInfo } from "../types";
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

export function ApplicantRow(props: { applicant: ApplicantInfo }) {
  const router = useRouter();
  const photoUrl = getSafeExternalUrl(props.applicant.photo);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  const handleApplicantClick = (applicantId: string) => {
    router.push(`/candidatos/${applicantId}`);
  };

  return (
    <TableRow
      key={props.applicant.id}
      onClick={() => handleApplicantClick(props.applicant.id)}
      className="group cursor-pointer border-b border-dashboard-border transition-colors hover:bg-dashboard-success-light last:border-0"
    >
      {/* Candidato */}
      <TableCell className="px-5 py-4 pl-5 align-middle">
        <div className="flex w-full items-center min-w-50 max-w-44 truncate text-sm font-semibold text-dashboard-text-muted whitespace-normal wrap-break-word text-centerjustify-center gap-3">
          {photoUrl && photoUrl !== failedPhoto ? (
            <Image
              src={photoUrl}
              alt={props.applicant.name || "-"}
              width={36}
              height={36}
              unoptimized
              onError={() => setFailedPhoto(photoUrl)}
              className="size-9 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${props.applicant.avatarBg}`}
            >
              {props.applicant.initials || "-"}
            </div>
          )}
          <span
            className="min-w-0 max-w-22.5 flex-1 truncate text-sm font-bold text-dashboard-dark text-center sm:max-w-32.5 md:max-w-45"
            title={props.applicant.name || "-"}
          >
            {props.applicant.name || "-"}
          </span>
        </div>
      </TableCell>

      {/* Etiquetas */}
      <TableCell className="px-3 py-4 align-middle">
        <div className="mx-auto flex w-full max-w-30 flex-wrap items-center justify-center gap-1.5 sm:max-w-40 md:max-w-55">
          {props.applicant.tags.length > 0 ? (
            props.applicant.tags.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                style={{
                  color: tag.color,
                  backgroundColor: `${tag.color}26`,
                }}
                title={tag.label || "-"}
                className={`max-w-full truncate rounded-full border-transparent px-2 py-0.5 text-xs font-bold text-center`}
              >
                {tag.label || "-"}
              </Badge>
            ))
          ) : (
            <span className="text-sm font-medium text-dashboard-text-muted">
              -
            </span>
          )}
        </div>
      </TableCell>

      {/* Vacante */}
      <TableCell className="px-3 py-4">
        <div
          className="min-w-50 max-w-44 truncate text-sm font-semibold text-dashboard-text-muted whitespace-normal wrap-break-word text-center"
          title={
            props.applicant.jobOpening.length <= 1
              ? ""
              : props.applicant.jobOpening.join(", \n")
          }
        >
          {props.applicant.jobOpening[props.applicant.jobOpening.length - 1]}
          {props.applicant.jobOpening.length - 1 <= 0 ? (
            ""
          ) : (
            <span className="block">
              +{props.applicant.jobOpening.length - 1}
            </span>
          )}
        </div>
      </TableCell>

      {/* Rol */}
      <TableCell className="px-3 py-4 align-middle text-center">
        <div
          className="mx-auto min-w-40 max-w-22.5 whitespace-normal wrap-break-word text-sm font-medium text-dashboard-text-muted sm:max-w-30 md:max-w-37.5"
          title={props.applicant.role || "-"}
        >
          {props.applicant.role || "-"}
        </div>
      </TableCell>

      {/* Seniority */}
      <TableCell className="px-3 py-4 align-middle">
        <div className="flex w-full items-center justify-center">
          {props.applicant.seniorityName ? (
            <Badge
              style={{
                color: props.applicant.seniorityColor,
                backgroundColor: `${props.applicant.seniorityColor}26`,
              }}
              variant="secondary"
              title={props.applicant.seniorityName}
              className={`max-w-20 truncate rounded-md border-transparent px-2 py-1 text-xs font-bold text-center sm:max-w-25`}
            >
              {props.applicant.seniorityName}
            </Badge>
          ) : (
            <span className="text-sm font-medium text-dashboard-text-muted">
              -
            </span>
          )}
        </div>
      </TableCell>

      {/* Área */}
      <TableCell className="px-3 py-4 align-middle text-center">
        <div
          className="mx-auto min-w-40 max-w-22.5 whitespace-normal wrap-break-word text-sm font-medium text-dashboard-text-muted sm:max-w-30 md:max-w-37.5"
          title={props.applicant.area || "-"}
        >
          {props.applicant.area || "-"}
        </div>
      </TableCell>

      {/* Source */}
      <TableCell className="px-3 py-4 align-middle">
        <div className="mx-auto flex w-full max-w-25 items-center justify-center gap-1.5 text-sm font-semibold text-dashboard-text-muted text-center sm:max-w-32.5">
          {props.applicant.sourceText ? (
            <>
              <span className="shrink-0">
                {getSourceIcon(props.applicant.sourceText)}
              </span>
              <span className="truncate" title={props.applicant.sourceText}>
                {props.applicant.sourceText}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-dashboard-text-muted">
              -
            </span>
          )}
        </div>
      </TableCell>

      {/* CV */}
      <TableCell className="px-3 py-4 text-center align-middle">
        {props.applicant.hasCv && props.applicant.cvUrl ? (
          <a
            href={props.applicant.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Descargar CV"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-dashboard-text-muted transition-colors hover:bg-dashboard-track hover:text-dashboard-dark"
          >
            <FileText size={15} />
          </a>
        ) : (
          <span className="text-sm font-medium text-dashboard-text-muted">
            -
          </span>
        )}
      </TableCell>

      {/* LinkedIn */}
      <TableCell className="px-3 py-4 text-center align-middle">
        {props.applicant.hasLinkedin && props.applicant.linkedinUrl ? (
          <a
            href={props.applicant.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Ver perfil de LinkedIn"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#0a66c2] transition-colors hover:bg-dashboard-track hover:text-[#004182]"
          >
            {<FaLinkedin size={15} />}
          </a>
        ) : (
          <span className="text-sm font-medium text-dashboard-text-muted">
            -
          </span>
        )}
      </TableCell>

      {/* Email */}
      <TableCell className="px-3 py-4 pr-5 align-middle">
        <div
          className="mx-auto whitespace-nowrap text-center text-sm font-medium text-dashboard-text-muted"
          title={props.applicant.email || "-"}
        >
          {props.applicant.email || "-"}
        </div>
      </TableCell>
    </TableRow>
  );
}
