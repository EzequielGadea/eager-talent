import { Users } from "lucide-react";

import { api } from "~/lib/trpc/server";
import { getInitials } from "./app-header";
import { VacanciesIcon } from "./app-icons";
import { NavigationItem } from "./navigation-item";

export async function HiringManagerNavigation() {
  const [jobOpeningsAmount, applicantsAmount, assignedJobOpenings] =
    await Promise.all([
      api.jobOpening.getJobOpeningsAmount({}),
      api.applicant.fetchAmount({}),
      api.jobOpening.getAllJobOpenings({}),
    ]);

  return (
    <>
      <p className="px-3 pt-3.5 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-text-tertiary">
        PRINCIPAL
      </p>

      <NavigationItem
        icon={<VacanciesIcon className="size-4.5" aria-hidden="true" />}
        label="Mis vacantes"
        href="/job-openings"
        count={jobOpeningsAmount.total}
        exact
      />

      <NavigationItem
        icon={<Users className="size-4.5" aria-hidden="true" />}
        label="Candidatos"
        href="/applicants"
        count={applicantsAmount}
      />

      <p className="px-3 pt-4 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-text-tertiary">
        ASIGNADAS A MÍ
      </p>

      {assignedJobOpenings.length === 0 ? (
        <p className="px-3 py-2 text-xs text-text-tertiary">
          No tenés vacantes asignadas.
        </p>
      ) : (
        assignedJobOpenings.map((jobOpening) => (
          <NavigationItem
            key={jobOpening.id}
            icon={
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-md bg-tag-purple-bg text-[10px] font-semibold text-tag-purple-fg"
                aria-hidden="true"
              >
                {getInitials(jobOpening.name)}
              </span>
            }
            label={jobOpening.name}
            href={`/job-openings/${jobOpening.id}`}
          />
        ))
      )}
    </>
  );
}
