'use client'

import { FileText } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import {
  TableCell,
  TableRow,
} from "~/components/ui/table";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { ApplicantInfo } from "../types";

export function ApplicantRow(props : {applicant : ApplicantInfo}) {
    const router = useRouter();

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
                <TableCell className="px-5 py-4 pl-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${props.applicant.avatarBg}`}
                    >
                      {props.applicant.initials}
                    </div>
                    <span className="max-w-36 truncate text-sm font-bold text-dashboard-dark whitespace-normal break-words text-center">
                      {props.applicant.name}
                    </span>
                  </div>
                </TableCell>

                {/* Etiquetas */}
                <TableCell className="px-3 py-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {props.applicant.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        style={{ 
                          color: tag.color,
                          backgroundColor: `${tag.color}26`,
                         }}
                        className={`rounded-full border-transparent px-2 py-0.5 text-xs font-bold text-center`}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </TableCell>

                {/* Vacante */}
                <TableCell className="px-3 py-4">
                  <div
                    className="max-w-44 truncate text-sm font-semibold text-dashboard-text-muted whitespace-normal break-words text-center"
                    title={props.applicant.jobOpening}
                  >
                    {props.applicant.jobOpening}
                  </div>
                </TableCell>

                {/* Rol */}
                <TableCell className="px-3 py-4 text-sm font-medium text-dashboard-text-muted whitespace-normal break-words text-center">
                  {props.applicant.role}
                </TableCell>

                {/* Seniority */}
                <TableCell className="px-3 py-4">
                  <Badge
                    style={{ 
                      color: props.applicant.seniorityColor,
                      backgroundColor: `${props.applicant.seniorityColor}26`,
                    }}
                    variant="secondary"
                    className={`rounded-md border-transparent px-2 py-1 text-xs font-bold whitespace-normal break-words text-center`}
                  >
                    {props.applicant.seniorityName}
                  </Badge>
                </TableCell>

                {/* Área */}
                <TableCell className="px-3 py-4 text-sm font-medium text-dashboard-text-muted whitespace-normal break-words text-center">
                  {props.applicant.area}
                </TableCell>

                {/* Source */}
                <TableCell className="px-3 py-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-dashboard-text-muted text-center">
                    <span className="shrink-0">{props.applicant.sourceIcon}</span>
                    <span className="truncate">{props.applicant.sourceText}</span>
                  </div>
                </TableCell>

                {/* CV */}
                <TableCell className="px-3 py-4 text-center">
                  {props.applicant.hasCv ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 w-7 text-dashboard-text-muted hover:bg-dashboard-track hover:text-dashboard-dark"
                      title="Ver CV"
                    >
                      <FileText size={15} />
                    </Button>
                  ): null}
                </TableCell>

                {/* LinkedIn */}
                <TableCell className="px-3 py-4 text-center">
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
                  ) : null}
                </TableCell>

                {/* Email */}
                <TableCell className="px-3 py-4 pr-5">
                  <div
                    className="max-w-48 truncate text-sm font-medium text-dashboard-text-muted text-center"
                    title={props.applicant.email}
                  >
                    <span className="max-w-36 truncate text-sm whitespace-normal break-words text-center">
                      {props.applicant.email}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
    )
}