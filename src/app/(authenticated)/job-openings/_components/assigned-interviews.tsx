"use client";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

import { api } from "~/lib/trpc/react";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function AssignedInterviews() {
  const router = useRouter();

  const {
    data: interviews,
    isLoading,
    isError,
  } = api.interview.getAssignedInterviews.useQuery();

  return (
    <section className="w-full overflow-hidden rounded-xl border border-dashboard-border bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-dashboard-border px-4 py-3">
        <CalendarDays size={16} className="text-dashboard-text-muted" />

        <h2 className="text-sm font-semibold text-text-primary">
          Entrevistas asignadas a vos
        </h2>
      </div>

      {isLoading ? (
        <div className="flex flex-col divide-y divide-dashboard-border">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>

              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="px-4 py-6 text-sm text-danger">
          No se pudieron cargar las entrevistas.
        </p>
      ) : !interviews?.length ? (
        <p className="px-4 py-6 text-center text-sm text-text-secondary">
          No tenés entrevistas asignadas.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-dashboard-border">
          {interviews.map((interview) => {
            const applicantName = `${interview.applicant.name} ${interview.applicant.lastName}`;
            const applicantInitials =
              `${interview.applicant.name.charAt(0)}${interview.applicant.lastName.charAt(0)}`.toUpperCase();

            const jobOpeningName =
              interview.application?.jobOpening.name ??
              "Entrevista exploratoria";

            const formattedDate = interview.date
              ? new Intl.DateTimeFormat("es-UY", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(interview.date))
              : "Sin fecha definida";

            return (
              <div
                key={interview.id}
                className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Link
                    href={`/applicants/${interview.applicant.id}`}

                    className="group flex min-w-0 items-center gap-3"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage
                        src={interview.applicant.photo ?? undefined}
                        alt={applicantName}
                        className="object-cover"
                      />

                      <AvatarFallback className="bg-dashboard-purple-avatar text-xs font-semibold text-dashboard-purple-text">
                        {applicantInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-text-link group-hover:underline">
                        {applicantName}
                      </p>

                      <p className="text-xs text-text-secondary">
                        {interview.name} · {jobOpeningName} · {formattedDate}
                      </p>
                    </div>
                  </Link>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full border-dashboard-border"
                  onClick={() => router.push(`/interviews/${interview.id}`)}
                >
                  Ver
                  <ArrowRight size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
