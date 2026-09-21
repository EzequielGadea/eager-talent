import { Search } from "lucide-react";
import { SettingsIcon } from "./app-icons";

export function AppHeader() {
  return (
    <header className="flex h-15 shrink-0 items-center gap-4 border-b border-border-default bg-white px-6">
      <div className="relative flex w-full max-w-110 items-center">
        <Search
          className="pointer-events-none absolute left-3 size-4 text-text-tertiary"
          aria-hidden="true"
        />

        <input
          type="search"
          aria-label="Buscar"
          placeholder="Buscar candidatos, vacantes o etiquetas…"
          className="h-9.5 w-full rounded-md border border-border-default bg-slate-50 py-2 pr-14 pl-9 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-focus"
        />

        <kbd className="absolute right-2.5 rounded border border-border-default bg-white px-1.5 py-0.5 text-[11px] text-text-tertiary">
          ⌘K
        </kbd>
      </div>

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
