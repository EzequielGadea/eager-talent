import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import { InterviewsIcon, VacanciesIcon } from "../../_components/app-icons";

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  iconContainerClassName: string;
};

function MetricCard({ icon, label, iconContainerClassName }: MetricCardProps) {
  return (
    <article className="flex min-h-32 items-start gap-4 rounded-lg border border-border-default bg-white p-5 shadow-sm">
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconContainerClassName}`}
      >
        {icon}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="text-[13px] font-normal text-text-secondary">{label}</h2>

        <div
          className="mt-2 h-8 w-16 rounded-md bg-slate-200"
          aria-label={`${label}: dato pendiente de cargar`}
        />

        <div className="mt-2 h-3 w-32 rounded-full bg-slate-100" />
      </div>
    </article>
  );
}

export function DashboardMetrics() {
  return (
    <section
      aria-label="Indicadores principales"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <MetricCard
        icon={
          <VacanciesIcon
            className="size-5.5 text-accent-green-strong"
            aria-hidden="true"
          />
        }
        label="Vacantes activas"
        iconContainerClassName="bg-success-bg"
      />

      <MetricCard
        icon={<Clock className="size-5.5 text-info" aria-hidden="true" />}
        label="Tiempo medio de cierre"
        iconContainerClassName="bg-info-bg"
      />

      <MetricCard
        icon={
          <InterviewsIcon
            className="size-5.5 text-tag-purple-fg"
            aria-hidden="true"
          />
        }
        label="Entrevistas esta semana"
        iconContainerClassName="bg-tag-purple-bg"
      />
    </section>
  );
}
