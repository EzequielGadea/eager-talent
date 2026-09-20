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
    router.push(`/candidates/${applicantId}`);
  };

  return (
    <TableRow
      onClick={() => handleApplicantClick(props.applicant.id)}
      className="group cursor-pointer border-b border-dashboard-border transition-colors hover:bg-dashboard-success-light last:border-0"
    >
      {/* Candidato */}
      <TableCell className="px-2 py-2 align-middle">
        <div className="flex min-w-0 items-center gap-2">
          {photoUrl && photoUrl !== failedPhoto ? (
            <Image
              src={photoUrl}
              alt={props.applicant.name || "-"}
              width={28}
              height={28}
              unoptimized
              onError={() => setFailedPhoto(photoUrl)}
              className="size-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${props.applicant.avatarBg}`}
            >
              {props.applicant.initials || "-"}
            </div>
          )}

          <span
            className="min-w-0 line-clamp-2 break-words whitespace-normal text-xs font-semibold leading-tight text-dashboard-dark"
            title={props.applicant.name || "-"}
          >
            {props.applicant.name || "-"}
          </span>
        </div>
      </TableCell>

      {/* Etiquetas */}
      <TableCell className="px-2 py-2 align-middle">
        <div className="@container">
          <div className="flex flex-col items-center gap-1 @[10px]:flex-row @[10px]:flex-wrap @[10px]:justify-center">
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
                  className="whitespace-nowrap rounded-full border-transparent px-2 py-0.5 text-[10px] font-semibold leading-4"
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
        </div>
      </TableCell>

      {/* Vacante */}
      <TableCell className="px-3 py-2 align-middle">
        <div
          className="line-clamp-2 break-words text-center text-xs leading-tight text-dashboard-text-muted"
          title={
            props.applicant.jobOpening.length <= 1
              ? ""
              : props.applicant.jobOpening.join(", ")
          }
        >
          {props.applicant.jobOpening[props.applicant.jobOpening.length - 1] ||
            "-"}

          {props.applicant.jobOpening.length > 1 && (
            <span className="block">
              +{props.applicant.jobOpening.length - 1}
            </span>
          )}
        </div>
      </TableCell>

      {/* Rol */}
      <TableCell className="px-3 py-2 align-middle">
        <div
          className="line-clamp-2 break-words text-center text-xs leading-tight text-dashboard-text-muted"
          title={props.applicant.role || "-"}
        >
          {props.applicant.role || "-"}
        </div>
      </TableCell>

      {/* Seniority */}
      <TableCell className="px-2 py-2 text-center align-middle">
        {props.applicant.seniorityName ? (
          <Badge
            style={{
              color: props.applicant.seniorityColor,
              backgroundColor: `${props.applicant.seniorityColor}26`,
            }}
            variant="secondary"
            title={props.applicant.seniorityName}
            className="whitespace-nowrap rounded-md border-transparent px-2 py-0.5 text-[10px] font-bold leading-4"
          >
            {props.applicant.seniorityName}
          </Badge>
        ) : (
          <span className="text-sm font-medium text-dashboard-text-muted">
            -
          </span>
        )}
      </TableCell>

      {/* Área */}
      <TableCell className="px-3 py-2 align-middle">
        <div
          className="line-clamp-2 break-words text-center text-xs leading-tight text-dashboard-text-muted"
          title={props.applicant.area || "-"}
        >
          {props.applicant.area || "-"}
        </div>
      </TableCell>

      {/* Fuente */}
      <TableCell className="px-2 py-2 align-middle">
        <div className="flex min-w-0 items-center justify-center gap-1 text-center text-sm text-dashboard-text-muted">
          {props.applicant.sourceText ? (
            <>
              <span className="shrink-0">
                {getSourceIcon(props.applicant.sourceText)}
              </span>

              <span
                className="min-w-0 line-clamp-2 break-words leading-tight text-xs"
                title={props.applicant.sourceText}
              >
                {props.applicant.sourceText}
              </span>
            </>
          ) : (
            <span>-</span>
          )}
        </div>
      </TableCell>

      {/* CV */}
      <TableCell className="w-px whitespace-nowrap px-2 py-2 text-center align-middle">
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
      <TableCell className="w-px whitespace-nowrap px-2 py-2 text-center align-middle">
        {props.applicant.hasLinkedin && props.applicant.linkedinUrl ? (
          <a
            href={props.applicant.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Ver perfil de LinkedIn"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#0a66c2] transition-colors hover:bg-dashboard-track hover:text-[#004182]"
          >
            <FaLinkedin size={15} />
          </a>
        ) : (
          <span className="text-sm font-medium text-dashboard-text-muted">
            -
          </span>
        )}
      </TableCell>

      {/* Email */}
      <TableCell className="px-3 py-2 align-middle">
        <div
          className="line-clamp-2 break-words whitespace-normal text-center text-xs leading-tight text-dashboard-text-muted [overflow-wrap:anywhere]"
          title={props.applicant.email || "-"}
        >
          {props.applicant.email || "-"}
        </div>
      </TableCell>
    </TableRow>
  );
}
