import { CalendarCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export type PublicInterviewItem = {
  id: string;
  name: string;
  duration?: number | null;
  modality?: string | null;
  date?: string | null;
  interviewers: string[];
  note?: string | null;
};

type PublicInterviewsCardProps = {
  interviews: PublicInterviewItem[];
};

export function PublicInterviewsCard({ interviews }: PublicInterviewsCardProps) {
  if (interviews.length === 0) {
    return (
      <Card className="min-w-0">
        <CardHeader className="flex flex-row items-center gap-2">
          <CalendarCheck className="size-4 text-text-secondary" />
          <CardTitle className="text-base font-bold text-text-primary">
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
        <CardTitle className="text-base font-bold text-text-primary">
          Proceso de entrevistas
        </CardTitle>
        <span className="text-xs text-text-tertiary">
          — notas incluidas
        </span>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-5 pt-4">
        {interviews.map((interview) => (
          <div
            key={interview.id}
            className="flex flex-col gap-3 rounded-xl border border-border-default bg-card p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  {interview.name}
                </h3>
                {(interview.duration || interview.modality) && (
                  <p className="text-xs text-text-secondary">
                    {[
                      interview.duration ? `${interview.duration} min` : null,
                      interview.modality,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <div className="text-right text-xs text-text-secondary">
                {interview.date && (
                  <p className="font-medium text-text-primary">
                    {interview.date}
                  </p>
                )}
                {interview.interviewers.length > 0 && (
                  <p className="text-text-tertiary">
                    {interview.interviewers.join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border-default bg-surface-subtle p-3.5">
              {interview.note ? (
                <>
                  <p className="text-[10px] font-bold tracking-wider text-text-tertiary uppercase">
                    Notas de la entrevista
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary whitespace-pre-line">
                    {interview.note}
                  </p>
                </>
              ) : (
                <p className="text-xs text-text-tertiary">
                  Sin notas registradas todavía.
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
