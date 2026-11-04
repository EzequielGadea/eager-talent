import { CalendarCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { InterviewType } from "~/generated/prisma/enums";
import { interviewTypeTranslations } from "~/lib/enum-translations";

export type PublicInterviewItem = {
  id: string;
  name: string;
  duration?: number | null;
  modality?: InterviewType | null;
  date?: string | null;
  interviewers: string[];
  note?: string | null;
};

type PublicInterviewsCardProps = {
  interviews: PublicInterviewItem[];
};

export function PublicInterviewsCard({
  interviews,
}: PublicInterviewsCardProps) {
  if (interviews.length === 0) {
    return (
      <Card className="min-w-0">
        <CardHeader className="flex flex-row items-center gap-2">
          <CalendarCheck className="size-4 text-text-secondary" />
          <CardTitle className="text-h3 text-text-primary">
            Proceso de entrevistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            No hay entrevistas registradas para esta postulación aún.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <CalendarCheck className="size-4 shrink-0 text-text-secondary" />
        <CardTitle className="text-h3 text-text-primary">
          Proceso de entrevistas
        </CardTitle>
        <span className="text-xs text-text-tertiary">— notas incluidas</span>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col px-0">
        {interviews.map((interview) => (
          <div
            key={interview.id}
            className="border-b border-border-default px-4.5 py-4 last:border-b-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-sans text-sm font-semibold text-text-primary">
                  {interview.name}
                </h3>
                {(interview.duration || interview.modality) && (
                  <p className="text-xs text-text-tertiary">
                    {[
                      interview.duration ? `${interview.duration} min` : null,
                      interview.modality
                        ? interviewTypeTranslations[interview.modality]
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-small text-text-secondary">
                {interview.date && <span>{interview.date}</span>}
                {interview.interviewers.length > 0 && (
                  <span>{interview.interviewers.join(", ")}</span>
                )}
              </div>
            </div>

            {interview.note ? (
              <div className="mt-3 rounded-md bg-surface-subtle px-3.5 py-3 text-small leading-relaxed text-text-primary">
                <span className="mb-1.25 block text-label font-bold tracking-wider text-text-tertiary uppercase">
                  Notas de la entrevista
                </span>
                <span className="whitespace-pre-line">{interview.note}</span>
              </div>
            ) : (
              <div className="mt-3 rounded-md bg-surface-subtle px-3.5 py-2.75 text-small text-text-tertiary">
                Sin notas registradas todavía.
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
