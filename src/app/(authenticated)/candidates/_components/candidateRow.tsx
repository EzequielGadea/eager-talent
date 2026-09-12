'use client'

import { FileText } from "lucide-react";

import {
  TableCell,
  TableRow,
} from "~/components/ui/table";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { CandidateInfo, getTagClasses, getSeniorityClasses } from "../types";

export function CandidateRow(props : {candidate : CandidateInfo}) {
    const router = useRouter();

    const handleCandidateClick = (candidateId: string) => {
        router.push(`/candidatos/${candidateId}`);
    };

    return (
        <TableRow
                key={props.candidate.id}
                onClick={() => handleCandidateClick(props.candidate.id)}
                className="group cursor-pointer border-b border-dashboard-border transition-colors hover:bg-dashboard-success-light last:border-0"
              >
                {/* Candidato */}
                <TableCell className="px-5 py-4 pl-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${props.candidate.avatarBg}`}
                    >
                      {props.candidate.initials}
                    </div>
                    <span className="max-w-36 truncate text-sm font-bold text-dashboard-dark whitespace-normal break-words text-center">
                      {props.candidate.name}
                    </span>
                  </div>
                </TableCell>

                {/* Etiquetas */}
                <TableCell className="px-3 py-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {props.candidate.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={`rounded-full border-transparent px-2 py-0.5 text-xs font-bold text-center ${getTagClasses(
                          tag.type
                        )}`}
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
                    title={props.candidate.vacancy}
                  >
                    {props.candidate.vacancy}
                  </div>
                </TableCell>

                {/* Rol */}
                <TableCell className="px-3 py-4 text-sm font-medium text-dashboard-text-muted whitespace-normal break-words text-center">
                  {props.candidate.role}
                </TableCell>

                {/* Seniority */}
                <TableCell className="px-3 py-4">
                  <Badge
                    variant="secondary"
                    className={`rounded-md border-transparent px-2 py-1 text-xs font-bold whitespace-normal break-words text-center ${getSeniorityClasses(
                      props.candidate.seniorityName
                    )}`}
                  >
                    {props.candidate.seniorityName}
                  </Badge>
                </TableCell>

                {/* Área */}
                <TableCell className="px-3 py-4 text-sm font-medium text-dashboard-text-muted whitespace-normal break-words text-center">
                  {props.candidate.area}
                </TableCell>

                {/* Source */}
                <TableCell className="px-3 py-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-dashboard-text-muted text-center">
                    <span className="shrink-0">{props.candidate.sourceIcon}</span>
                    <span className="truncate">{props.candidate.sourceText}</span>
                  </div>
                </TableCell>

                {/* CV */}
                <TableCell className="px-3 py-4 text-center">
                  {props.candidate.hasCv && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 w-7 text-dashboard-text-muted hover:bg-dashboard-track hover:text-dashboard-dark"
                      title="Ver CV"
                    >
                      <FileText size={15} />
                    </Button>
                  )}
                </TableCell>

                {/* LinkedIn */}
                <TableCell className="px-3 py-4 text-center">
                  {props.candidate.hasLinkedin && props.candidate.linkedinUrl ? (
                    <a
                      href={props.candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Ver perfil de LinkedIn"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#0a66c2] transition-colors hover:bg-dashboard-track hover:text-[#004182]"
                    >
                      {/*<FaLinkedin size={15} />*/}
                    </a>
                  ) : null}
                </TableCell>

                {/* Email */}
                <TableCell className="px-3 py-4 pr-5">
                  <div
                    className="max-w-48 truncate text-sm font-medium text-dashboard-text-muted text-center"
                    title={props.candidate.email}
                  >
                    {props.candidate.email}
                  </div>
                </TableCell>
              </TableRow>
    )
}