export function DashboardHeader() {
  return (
    <header>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">
        Dashboard
      </h1>

      <div
        className="mt-2 h-3.5 w-48 rounded-full bg-slate-200"
        aria-label="Fecha pendiente de cargar"
      />
    </header>
  );
}
