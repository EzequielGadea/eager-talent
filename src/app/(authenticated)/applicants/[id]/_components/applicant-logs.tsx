"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Clock } from "lucide-react";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/trpc/react";
import { ApplicantLogsFilter } from "./applicant-logs-filter";

function formatActivityDate(date: Date) {
  return format(new TZDate(date, "America/Montevideo"), "dd MMM yyyy HH:mm", {
    locale: es,
  });
}

export function ApplicantLogs({ applicantId }: { applicantId: string }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [jobOpeningId, setJobOpeningId] = useState<string | undefined>();

  const { data, isLoading, error } = api.activity.getByApplicantId.useQuery({
    applicantId,
    jobOpeningId,
    page,
  });

  if (error) {
    return (
      <Card className="min-w-0">
        <CardContent className="pt-6">
          <Alert className="flex flex-col items-start gap-3">
            <AlertTitle>
              <h2>Error</h2>
            </AlertTitle>
            <AlertDescription>
              La postulación seleccionada no está disponible. Volvé a consultar
              todas las postulaciones.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const {
    applications = [],
    activities = [],
    total = 0,
    page: current = 1,
    pageSize = 10,
    totalPages = 1,
  } = data || {};
  const selectedApp = applications.find(
    (app) => app.jobOpeningId === jobOpeningId,
  );
  const firstRecord = (current - 1) * pageSize + 1;
  const pages = [...new Set([1, current - 1, current, current + 1, totalPages])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const setPageAndScroll = (newPage: number) => {
    flushSync(() => {
      setPage(newPage);
    });
    headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Card className="min-w-0">
      <CardHeader
        ref={headerRef}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Clock className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 wrap-anywhere">
            <CardTitle>
              <h2>Logs</h2>
            </CardTitle>
            <CardDescription>
              {!data ? (
                <Skeleton className="mt-1 h-4 w-48" />
              ) : (
                `${total} registros — ${selectedApp ? `actividad en ${selectedApp.name}` : "actividad del candidato"}`
              )}
            </CardDescription>
          </div>
        </div>
        {!data ? (
          <Skeleton className="h-9 w-30" />
        ) : (
          <ApplicantLogsFilter
            applications={applications}
            jobOpeningId={jobOpeningId}
            onFilterChange={(id) => {
              setJobOpeningId(id);
              setPageAndScroll(1);
            }}
          />
        )}
      </CardHeader>
      <Separator />

      <CardContent
        className="w-full min-w-0"
        role="region"
        aria-label="Registros de actividad"
        tabIndex={0}
      >
        {!isLoading && activities.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyDescription>
                {jobOpeningId
                  ? "No hay actividad registrada para esta postulación."
                  : "No hay actividad registrada para este candidato."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table className="min-w-160 table-fixed text-left">
            <TableCaption className="sr-only">
              Registros de actividad del candidato
            </TableCaption>
            <colgroup>
              <col className="w-42.5" />
              <col />
              <col className="w-57.5" />
            </colgroup>
            <TableHeader>
              <TableRow className="text-xs font-semibold uppercase text-muted-foreground hover:bg-transparent">
                <TableHead className="py-3 pr-3">Fecha</TableHead>
                <TableHead className="py-3 pr-3">Evento</TableHead>
                <TableHead className="py-3">Postulación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || !data
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-4 pr-3">
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="py-4 pr-3">
                        <Skeleton className="h-5 w-3/4" />
                      </TableCell>
                      <TableCell className="py-4">
                        <Skeleton className="h-7 w-32 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : activities.map(({ id, date, description, application }) => (
                    <TableRow key={id} className="text-sm">
                      <TableCell className="whitespace-nowrap py-3 pr-3 text-muted-foreground">
                        <time dateTime={new Date(date).toISOString()}>
                          {formatActivityDate(new Date(date))}
                        </time>
                      </TableCell>
                      <TableCell className="wrap-break-word py-3 pr-3">
                        {description}
                      </TableCell>
                      <TableCell className="wrap-break-word py-3">
                        <Badge
                          variant="tag"
                          className="h-auto max-w-full justify-center whitespace-normal text-center"
                          style={
                            {
                              "--badge-background": application
                                ? "var(--tag-blue-bg)"
                                : "var(--tag-gray-bg)",
                              "--badge-foreground": application
                                ? "var(--tag-blue-fg)"
                                : "var(--tag-gray-fg)",
                              "--badge-border": "transparent",
                            } as React.CSSProperties
                          }
                        >
                          <span className="min-w-0 wrap-break-word">
                            {application?.jobOpening.name || "Candidato"}
                          </span>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {(isLoading || activities.length > 0) && (
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          {isLoading || !data ? (
            <>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-75" />
            </>
          ) : (
            <>
              <span>
                {firstRecord}–{firstRecord + activities.length - 1} de {total}{" "}
                registros
              </span>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      text="Página anterior"
                      aria-disabled={current === 1}
                      className={
                        current === 1 ? "pointer-events-none opacity-50" : ""
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        if (current > 1) setPageAndScroll(current - 1);
                      }}
                    />
                  </PaginationItem>
                  {pages.map((p, i) => (
                    <PaginationItem key={p}>
                      {i > 0 && p - pages[i - 1] > 1 && <PaginationEllipsis />}
                      <PaginationLink
                        href="#"
                        isActive={p === current}
                        aria-label={`Página ${p}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setPageAndScroll(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      text="Página siguiente"
                      aria-disabled={current === totalPages}
                      className={
                        current === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        if (current < totalPages) setPageAndScroll(current + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
