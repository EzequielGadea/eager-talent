import { api } from "~/lib/trpc/server";

type CandidateApplicationsProps = {
  candidateId: string;
};

export async function CandidateApplications({
  candidateId,
}: CandidateApplicationsProps) {
  const applications = await api.application.getByCandidateId({
    candidateId,
  });

  if (applications.length === 0) {
    return (
      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-xs font-semibold uppercase text-muted-foreground">
          Postulación
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          El candidato no tiene postulaciones asociadas.
        </p>
      </section>
    );
  }

  const application = applications[0];

  return (
    <section className="rounded-xl border bg-white p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        Postulación
      </p>

      <h2 className="mt-2 font-semibold">{application.jobOpening.name}</h2>

      <div className="mt-3">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {application.active ? "En proceso" : "Inactiva"}
        </span>
      </div>

      <div className="mt-4 text-sm">
        <p className="text-muted-foreground">Etapa actual</p>
        <p className="font-medium">{application.currentStage}</p>
      </div>
    </section>
  );
}
