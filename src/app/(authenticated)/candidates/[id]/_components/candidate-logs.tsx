import { ChevronDown, Clock } from "lucide-react";

import { api } from "~/lib/trpc/server";

type CandidateLogsProps = {
  candidateId: string;
};

export async function CandidateLogs({ candidateId }: CandidateLogsProps) {
  const { activities, total } = await api.activity.getByCandidateId({
    candidateId,
  });

  return (
    <section className="rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>

          <div>
            <h2 className="font-semibold">Logs</h2>

            <p className="text-xs text-muted-foreground">
              {total} registros — actividad del candidato en todas sus
              postulaciones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs text-muted-foreground">
          Todas las postulaciones
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>

      {activities.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          No hay actividad registrada para este candidato.
        </p>
      ) : (
        <>
          <div className="px-5">
            <div className="grid grid-cols-[170px_minmax(0,1fr)_230px] gap-3 border-b py-3 text-xs font-semibold uppercase text-muted-foreground">
              <span>Fecha</span>
              <span>Evento</span>
              <span>Postulación</span>
            </div>

            {activities.map((activity) => (
              <div
                key={activity.id}
                className="grid grid-cols-[170px_minmax(0,1fr)_230px] items-center gap-3 border-b py-3 text-sm last:border-b-0"
              >
                <span className="whitespace-nowrap text-muted-foreground">
                  {formatActivityDate(activity.date)}
                </span>

                <span>{activity.description}</span>

                <ApplicationBadge
                  applicationName={activity.application?.jobOpening.name}
                />
              </div>
            ))}
          </div>

          <div className="border-t px-5 py-3 text-xs text-muted-foreground">
            1–{activities.length} de {total} registros
          </div>
        </>
      )}
    </section>
  );
}

type ApplicationBadgeProps = {
  applicationName?: string;
};

function ApplicationBadge({ applicationName }: ApplicationBadgeProps) {
  if (applicationName) {
    return (
      <div>
        <span className="inline-flex max-w-full rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium leading-tight text-blue-700">
          {applicationName}
        </span>
      </div>
    );
  }

  return (
    <div>
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
        Candidato
      </span>
    </div>
  );
}

function formatActivityDate(date: Date) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
