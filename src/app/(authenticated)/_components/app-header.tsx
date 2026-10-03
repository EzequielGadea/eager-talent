import { SettingsIcon } from "./app-icons";
import { GlobalSearch } from "./global-search";

export function AppHeader() {
  return (
    <header className="flex h-15 shrink-0 items-center gap-4 border-b border-border-default bg-white px-6">
      <GlobalSearch />

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Abrir configuración"
        className="flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-slate-50"
      >
        <SettingsIcon className="size-4.5" aria-hidden="true" />
      </button>

      <div className="h-7 w-px bg-border-default" />

      <div
        className="flex items-center gap-2.5"
        aria-label="Información del usuario"
      >
        <div className="size-8.5 rounded-full bg-slate-200" />

        <div className="flex w-28 flex-col gap-1.5">
          <div className="h-3 rounded-full bg-slate-200" />
          <div className="h-2.5 w-16 rounded-full bg-slate-100" />
        </div>
      </div>
    </header>
  );
}
