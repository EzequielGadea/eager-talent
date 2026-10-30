"use client";

import { FileText } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { TableCell, TableRow } from "~/components/ui/table";
import { useState } from "react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { ApplicantInfo } from "../types";
import { getSourceIcon } from "./source-icon";
import { sourceTranslations } from "~/lib/enum-translations";
import { getTagStyles } from "~/lib/tags/get-tag-styles";
import { columns } from "../constants";

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
    router.push(`/applicants/${applicantId}`);
  };

  return (
    <TableRow
      onClick={() => handleApplicantClick(props.applicant.id)}
      className="group cursor-pointer border-b border-dashboard-border transition-colors hover:bg-success-bg last:border-0"
    >
      {/* Applicant */}
      <TableCell className={`${columns.applicant} py-2 align-middle`}>
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

      {/* Tags */}
      <TableCell className={`${columns.tags} py-2 align-middle`}>
        <div className="@container">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {props.applicant.tags.length > 0 ? (
              <>
                {props.applicant.tags.slice(0, 3).map((tag, i) => (
                  <Badge
                    key={i}
                    variant="tag"
                    style={getTagStyles(tag.color ?? "gray")}
                    title={tag.label || "-"}
                    className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4"
                  >
                    {tag.label || "-"}
                  </Badge>
                ))}

                {props.applicant.tags.length > 3 && (
                  <Popover>
                    <PopoverTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer text-xs text-text-link hover:underline"
                    >
                      +{props.applicant.tags.length - 3}
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-56 p-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="mb-2 text-xs font-semibold text-text-primary">
                        Otras etiquetas
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {props.applicant.tags.slice(3).map((tag, i) => (
                          <Badge
                            key={i}
                            variant="tag"
                            style={getTagStyles(tag.color ?? "gray")}
                            title={tag.label || "-"}
                            className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4"
                          >
                            {tag.label || "-"}
                          </Badge>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </>
            ) : (
              <span className="text-sm font-medium text-dashboard-text-muted">
                -
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Job-Opening */}
      <TableCell className={`${columns.vacancy} py-2 align-middle`}>
        <div className="flex flex-wrap items-center justify-center gap-1 text-xs">
          <span className="break-words text-center text-dashboard-text-muted">
            {props.applicant.jobOpening.at(-1) || "-"}
          </span>

          {props.applicant.jobOpening.length > 1 && (
            <Popover>
              <PopoverTrigger
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer text-text-link hover:underline"
              >
                +{props.applicant.jobOpening.length - 1}
              </PopoverTrigger>

              <PopoverContent
                className="w-56 p-3"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="mb-2 text-xs font-semibold text-text-primary">
                  Otras vacantes
                </p>

                <div className="flex flex-col gap-2">
                  {props.applicant.jobOpening
                    .slice(0, -1)
                    .map((vacancy, index) => (
                      <span
                        key={`${vacancy}-${index}`}
                        className="text-sm text-text-secondary"
                      >
                        {vacancy}
                      </span>
                    ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </TableCell>

      {/* Role */}
      <TableCell className={`${columns.role} py-2 align-middle`}>
        <div
          className="break-words text-center text-xs leading-tight text-dashboard-text-muted"
          title={props.applicant.role || "-"}
        >
          {props.applicant.role || "-"}
        </div>
      </TableCell>

      {/* Seniority */}
      <TableCell
        className={`${columns.seniority} py-2 text-center align-middle`}
      >
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

      {/* Area */}
      <TableCell className={`${columns.area} py-2 align-middle`}>
        <div
          className="break-words text-center text-xs leading-tight text-dashboard-text-muted"
          title={props.applicant.area || "-"}
        >
          {props.applicant.area || "-"}
        </div>
      </TableCell>

      {/* Source */}
      <TableCell className={`${columns.source} py-2 align-middle`}>
        <div className="flex min-w-0 items-center justify-center gap-1 text-center text-sm text-dashboard-text-muted">
          {props.applicant.source ? (
            <>
              <span className="shrink-0">
                {getSourceIcon(props.applicant.source)}
              </span>

              <span
                className="min-w-0 line-clamp-2 break-words leading-tight text-xs"
                title={sourceTranslations[props.applicant.source]}
              >
                {sourceTranslations[props.applicant.source]}
              </span>
            </>
          ) : (
            <span>-</span>
          )}
        </div>
      </TableCell>

      {/* Resume */}
      <TableCell
        className={`${columns.cv} whitespace-nowrap py-2 text-center align-middle`}
      >
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
      <TableCell
        className={`${columns.linkedin} whitespace-nowrap px-2 py-2 text-center align-middle`}
      >
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
      <TableCell className={`${columns.email} py-2 align-middle`}>
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
