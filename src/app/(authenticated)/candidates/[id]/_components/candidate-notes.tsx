export function CandidateNotes() {
  return (
    <section className="rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Notas / Comentarios</h2>

        <span className="text-xs text-emerald-600">• Guardado ahora mismo</span>
      </div>

      <div className="border-b px-4 py-2 text-sm text-muted-foreground">
        Normal · &nbsp; B &nbsp; / &nbsp; U
      </div>

      <div className="min-h-[380px] space-y-4 p-4 text-sm">
        <p>Muy buen desempeño en la entrevista técnica.</p>

        <p>
          Demuestra sólidos conocimientos en sistemas distribuidos y buenas
          prácticas. Buena comunicación y actitud colaborativa.
        </p>

        <p>
          <strong>Siguiente paso:</strong> entrevista con liderazgo.
          <br />
          Evaluar fit cultural con el equipo de Backend.
        </p>
      </div>

      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        Última edición: ahora mismo
      </div>
    </section>
  );
}
