import { headers } from "next/headers";
import { Lock } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { auth } from "~/lib/auth";
import type { api } from "~/lib/trpc/server";
import {
  NO_APPLICATION_LABEL,
  formatInterviewDate,
} from "../_lib/interview-date";
import { DeleteInterviewButton } from "./delete-interview-button";
import { EditInterviewButton } from "./edit-interview-button";

type Interview = Awaited<ReturnType<typeof api.interview.getById>>;

type InterviewDetailsProps = {
  interviewPromise: Promise<Interview>;
};

const MODALITY_LABELS: Record<Interview["modality"], string> = {
  VideoCall: "Videollamada",
  InPerson: "Presencial",
};

export async function InterviewDetails({
  interviewPromise,
}: InterviewDetailsProps) {
  const interview = await interviewPromise;
  const requestHeaders = await headers();
  const [canUpdateInterview, canCreateInterview, canDeleteInterview] =
    await Promise.all([
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { interview: ["update"] } },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { interview: ["create"] } },
      }),
      auth.api.hasPermission({
        headers: requestHeaders,
        body: { permissions: { interview: ["delete"] } },
      }),
    ]);
  const canEdit = canUpdateInterview.success || canCreateInterview.success;

  const rows = [
    {
      label: "Fecha",
      value: interview.date
        ? formatInterviewDate(interview.date, { withTime: true })
        : "Sin fecha definida",
    },
    { label: "Duración", value: `${interview.duration} min` },
    { label: "Modalidad", value: MODALITY_LABELS[interview.modality] },
    {
      label: "Entrevistadores",
      value: interview.interviewers
        .map(({ name, lastName }) => `${name} ${lastName}`)
        .join(", "),
    },
    canEdit
      ? {
          label: "Postulación",
          value: interview.application?.jobOpening.name ?? NO_APPLICATION_LABEL,
        }
      : {
          label: "Te asignó",
          value: interview.assignedBy
            ? `${interview.assignedBy.name} ${interview.assignedBy.lastName}`
            : "—",
        },
  ];

  return (
    <>
      <Card className="max-h-[min(32rem,calc(100svh-8rem))] min-w-0 overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            <h2>Detalles</h2>
          </CardTitle>
          <CardAction>
            {canEdit ? (
              <EditInterviewButton
                interview={{
                  id: interview.id,
                  jobOpeningId: interview.jobOpeningId,
                  exploratoryName: interview.exploratoryName,
                  stageId: interview.stageId,
                  date: interview.date,
                  duration: interview.duration,
                  modality: interview.modality,
                  interviewers: interview.interviewers,
                }}
                candidateName={`${interview.applicant.name} ${interview.applicant.lastName}`}
              />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
                <Lock className="size-3.5" aria-hidden="true" />
                No editable
              </span>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3 text-sm">
            {rows.map(({ label, value }) => (
              <div
                key={label}
                className="flex min-w-0 items-center justify-between gap-30"
              >
                <dt className="shrink-0 text-text-tertiary">{label}</dt>
                <dd className="min-w-0 wrap-anywhere text-right font-semibold text-text-primary">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      {canDeleteInterview.success && (
        <DeleteInterviewButton
          interviewId={interview.id}
          interviewName={interview.name}
          applicantId={interview.applicantId}
        />
      )}
    </>
  );
}
