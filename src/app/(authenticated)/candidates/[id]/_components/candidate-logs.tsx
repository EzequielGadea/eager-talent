import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { TRPCError } from "@trpc/server";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Empty, EmptyHeader, EmptyDescription } from "~/components/ui/empty";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { getCandidate } from "../_lib/get-candidate";
import { Badge } from "~/components/ui/badge";
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
  const candidate = await getCandidate(candidateId);
  if (!candidate.permissions.canViewLogs) return null;

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
      <Alert className="flex flex-col items-start gap-3">
        <AlertTitle>
          <h2>Logs</h2>
        </AlertTitle>
        <AlertDescription>
          La postulación seleccionada no está disponible. Volvé a consultar
          todas las postulaciones.
        </AlertDescription>
        <Link
          href={pageHref(1, "")}
          scroll={false}
          className={buttonVariants({ variant: "outline" })}
        >
          Todas las postulaciones
        </Link>
      </Alert>
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
    <Card className="min-w-0">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Clock className="size-4 text-muted-foreground" />
          </div>

          <div className="min-w-0 wrap-anywhere">
            <CardTitle>
              <h2>Logs</h2>
            </CardTitle>

            <CardDescription>
              {total} registros —{" "}
              {selectedApplication
                ? `actividad en ${selectedApplication.name}`
                : "actividad del candidato"}
            </CardDescription>
          </div>
        </div>

        <CandidateLogsFilter
          applications={applications}
          jobOpeningId={jobOpeningId}
        />
      </CardHeader>
      <Separator />

      {activities.length === 0 ? (
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyDescription>
                {jobOpeningId
                  ? "No hay actividad registrada para esta postulación."
                  : "No hay actividad registrada para este candidato."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      ) : (
        <>
          <CardContent
            className="w-full min-w-0 overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            role="region"
            aria-label="Registros de actividad"
            tabIndex={0}
          >
            <div className="min-w-[640px]">
              <table className="w-full table-fixed text-left">
                <caption className="sr-only">
                  Registros de actividad del candidato
                </caption>
                <colgroup>
                  <col className="w-[170px]" />
                  <col />
                  <col className="w-[230px]" />
                </colgroup>
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground">
                    <th scope="col" className="py-3 pr-3">
                      Fecha
                    </th>
                    <th scope="col" className="py-3 pr-3">
                      Evento
                    </th>
                    <th scope="col" className="py-3">
                      Postulación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b text-sm last:border-b-0"
                    >
                      <td className="py-3 pr-3 whitespace-nowrap text-muted-foreground">
                        <time dateTime={activity.date.toISOString()}>
                          {formatActivityDate(activity.date)}
                        </time>
                      </td>
                      <td className="break-words py-3 pr-3">
                        {activity.description}
                      </td>
                      <td className="break-words py-3">
                        <ApplicationBadge
                          applicationName={
                            activity.application?.jobOpening.name
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-3">
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
          </CardFooter>
        </>
      )}
    </Card>
  );
}

type ApplicationBadgeProps = {
  applicationName?: string;
};

function ApplicationBadge({ applicationName }: ApplicationBadgeProps) {
  return (
    <Badge
      variant="tag"
      className="h-auto max-w-full whitespace-normal"
      style={
        {
          "--badge-background": applicationName
            ? "var(--tag-blue-bg)"
            : "var(--tag-gray-bg)",
          "--badge-foreground": applicationName
            ? "var(--tag-blue-fg)"
            : "var(--tag-gray-fg)",
          "--badge-border": "transparent",
        } as CSSProperties
      }
    >
      <span className="min-w-0 break-words">
        {applicationName || "Candidato"}
      </span>
    </Badge>
  );
}
