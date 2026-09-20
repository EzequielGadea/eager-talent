"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type CandidateLogsFilterProps = {
  applications: { jobOpeningId: string; name: string }[];
  jobOpeningId?: string;
};

export function CandidateLogsFilter({
  applications,
  jobOpeningId,
}: CandidateLogsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function changeApplication(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("logsJobOpeningId", value);
    } else {
      params.delete("logsJobOpeningId");
    }
    params.set("logsPage", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="relative min-w-0 max-w-full" aria-busy={isPending}>
      <select
        aria-label="Filtrar logs por postulación"
        value={jobOpeningId ?? ""}
        onChange={(event) => changeApplication(event.target.value)}
        disabled={isPending || applications.length === 0}
        className="max-w-full appearance-none rounded-full border bg-background py-2 pr-8 pl-3 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <option value="">Todas las postulaciones</option>
        {applications.map((application) => (
          <option
            key={application.jobOpeningId}
            value={application.jobOpeningId}
          >
            {application.name}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
