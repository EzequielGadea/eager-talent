import { Clock } from "lucide-react";

function InterviewPlaceholder() {
  return (
    <div className="flex items-center gap-3.5 border-b border-border-default py-3 last:border-b-0">
      <div className="h-3 w-10 shrink-0 rounded-full bg-slate-200" />

      <div className="size-8.5 shrink-0 rounded-full bg-slate-200" />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-3.5 w-32 max-w-full rounded-full bg-slate-200" />
        <div className="h-3 w-44 max-w-full rounded-full bg-slate-100" />
      </div>

      <div className="h-5 w-14 shrink-0 rounded-full bg-slate-100" />
    </div>
  );
}

export function TodaysInterviews() {
  return (
    <section
      aria-label="Entrevistas de hoy"
      aria-busy="true"
      className="rounded-lg border border-border-default bg-white p-5 shadow-sm"
    >
      <header className="mb-1 flex items-center gap-2">
        <Clock className="size-4.5 text-text-secondary" aria-hidden="true" />

        <h2 className="text-[15px] font-semibold text-text-primary">
          Entrevistas de hoy
        </h2>
      </header>

      <div>
        <InterviewPlaceholder />
        <InterviewPlaceholder />
        <InterviewPlaceholder />
        <InterviewPlaceholder />
        <InterviewPlaceholder />
      </div>
    </section>
  );
}
