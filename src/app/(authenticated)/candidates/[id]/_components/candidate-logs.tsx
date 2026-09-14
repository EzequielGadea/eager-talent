import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { TRPCError } from "@trpc/server";
import Link from "next/link";

import { buttonVariants } from "~/components/ui/button";
import { api } from "~/lib/trpc/server";
import { CandidateLogsFilter } from "./candidate-logs-filter";
import { formatActivityDate } from "../_lib/activity-date";

type CandidateLogsProps = {
  candidateId: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function CandidateLogs({
  candidateId,
  searchParams,
}: CandidateLogsProps) {
  const query = await searchParams;
  const requestedPage =
    typeof query.logsPage === "string" ? Number(query.logsPage) : 1;
  const jobOpeningId =
    typeof query.logsJobOpeningId === "string"
      ? query.logsJobOpeningId.trim() || undefined
      : undefined;
  const result = await api.activity
    .getByCandidateId({
      candidateId,
      jobOpeningId,
      page:
        Number.isSafeInteger(requestedPage) && requestedPage > 0
          ? requestedPage
          : 1,
    })
    .catch((error: unknown) => {
      if (
        jobOpeningId &&
        error instanceof TRPCError &&
        (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")
      ) {
        return null;
      }
      throw error;
    });

  function pageHref(targetPage: number, filter = jobOpeningId) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (
        key === "logsPage" ||
        key === "logsJobOpeningId" ||
        value === undefined
      )
        continue;
      for (const item of Array.isArray(value) ? value : [value]) {
        params.append(key, item);
      }
    }
    params.set("logsPage", String(targetPage));
    if (filter) params.set("logsJobOpeningId", filter);
    return `/candidates/${encodeURIComponent(candidateId)}?${params.toString()}`;
  }

  if (!result) {
    return (
      <section className="space-y-3 rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Logs</h2>
        <p role="alert" className="text-sm text-muted-foreground">
          La postulación seleccionada no está disponible. Volvé a consultar
          todas las postulaciones.
        </p>
        <Link
          href={pageHref(1, "")}
          scroll={false}
          className={buttonVariants({ variant: "outline" })}
        >
          Todas las postulaciones
        </Link>
      </section>
    );
  }

  const { activities, total, page, pageSize, totalPages, applications } =
    result;
  const selectedApplication = applications.find(
    (application) => application.jobOpeningId === jobOpeningId,
  );
  const firstRecord = (page - 1) * pageSize + 1;
  const pageNumbers = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  return (
    <section className="min-w-0 rounded-xl border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>

          <div>
            <h2 className="font-semibold">Logs</h2>

            <p className="text-xs text-muted-foreground">
              {total} registros —{" "}
              {selectedApplication
                ? `actividad en ${selectedApplication.name}`
                : "actividad del candidato"}
            </p>
          </div>
        </div>

        <CandidateLogsFilter
          applications={applications}
          jobOpeningId={jobOpeningId}
        />
      </div>

      {activities.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {jobOpeningId
            ? "No hay actividad registrada para esta postulación."
            : "No hay actividad registrada para este candidato."}
        </p>
      ) : (
        <>
          <div
            className="w-full min-w-0 overflow-x-auto"
            role="region"
            aria-label="Registros de actividad"
            tabIndex={0}
          >
            <div className="min-w-[640px] px-5">
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

                  <span className="min-w-0 break-words">
                    {activity.description}
                  </span>

                  <ApplicationBadge
                    applicationName={activity.application?.jobOpening.name}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs text-muted-foreground">
            <span>
              {firstRecord}–{firstRecord + activities.length - 1} de {total}{" "}
              registros
            </span>
            <nav
              aria-label="Paginación de logs"
              className="flex items-center gap-1"
            >
              {page === 1 ? (
                <span
                  aria-label="Página anterior"
                  aria-disabled="true"
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-sm",
                    className: "opacity-50",
                  })}
                >
                  <ChevronLeft />
                </span>
              ) : (
                <Link
                  href={pageHref(page - 1)}
                  scroll={false}
                  aria-label="Página anterior"
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-sm",
                  })}
                >
                  <ChevronLeft />
                </Link>
              )}
              {pageNumbers.map((pageNumber, index) => (
                <span key={pageNumber} className="flex items-center gap-1">
                  {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && (
                    <span className="px-1" aria-hidden="true">
                      …
                    </span>
                  )}
                  <Link
                    href={pageHref(pageNumber)}
                    scroll={false}
                    aria-label={`Página ${pageNumber}`}
                    aria-current={pageNumber === page ? "page" : undefined}
                    className={buttonVariants({
                      variant: pageNumber === page ? "default" : "outline",
                      size: "icon-sm",
                    })}
                  >
                    {pageNumber}
                  </Link>
                </span>
              ))}
              {page === totalPages ? (
                <span
                  aria-label="Página siguiente"
                  aria-disabled="true"
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-sm",
                    className: "opacity-50",
                  })}
                >
                  <ChevronRight />
                </span>
              ) : (
                <Link
                  href={pageHref(page + 1)}
                  scroll={false}
                  aria-label="Página siguiente"
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-sm",
                  })}
                >
                  <ChevronRight />
                </Link>
              )}
            </nav>
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
