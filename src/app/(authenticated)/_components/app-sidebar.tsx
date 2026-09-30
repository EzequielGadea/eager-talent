import { ChevronUp, FileText, House, Users } from "lucide-react";
import { Suspense } from "react";
import { MetricsIcon, SettingsIcon, VacanciesIcon } from "./app-icons";
import { NavigationItem } from "./navigation-item";

function EagerTalentBrand() {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
      <svg viewBox="0 0 40 40" className="size-7.5 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient
            id="sidebar-logo-gradient"
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <path
          d="M20 2C31 2 38 9 38 20C38 31 31 38 20 38C9 38 2 31 2 20C2 9 9 2 20 2Z"
          fill="url(#sidebar-logo-gradient)"
        />

        <g
          fill="none"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 22L20 15L27 22" strokeWidth="4" />
          <path d="M13 29.5L20 22.5L27 29.5" strokeWidth="4" opacity="0.5" />
        </g>
      </svg>

      <span className="font-heading text-[19px] font-bold tracking-[-0.03em] text-text-primary">
        EagerTalent
      </span>
    </div>
  );
}

function SidebarUserPlaceholder() {
  return (
    <div className="flex items-center gap-2.5 border-t border-border-default p-3">
      <div className="size-8.5 shrink-0 rounded-full bg-slate-200" />

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="h-2.5 w-16 rounded-full bg-slate-100" />
      </div>

      <ChevronUp className="size-4 text-text-tertiary" aria-hidden="true" />
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="flex min-h-screen w-60 shrink-0 flex-col border-r border-border-default bg-white">
      <EagerTalentBrand />

      <Suspense fallback={null}>
        <nav
          aria-label="Navegación principal"
          className="flex flex-1 flex-col px-3"
        >
          <p className="px-3 pt-3.5 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-text-tertiary">
            PRINCIPAL
          </p>

          <NavigationItem
            icon={<House className="size-4.5" aria-hidden="true" />}
            label="Dashboard"
            href="/dashboard"
          />

          <NavigationItem
            icon={<Users className="size-4.5" aria-hidden="true" />}
            label="Candidatos"
            href="/applicants"
          />

          <NavigationItem
            icon={<VacanciesIcon className="size-4.5" aria-hidden="true" />}
            label="Vacantes"
            href="/job-openings"
          />

          <p className="px-3 pt-4 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-text-tertiary">
            ANÁLISIS
          </p>

          <NavigationItem
            icon={<MetricsIcon className="size-4.5" aria-hidden="true" />}
            label="Métricas"
          />

          <NavigationItem
            icon={<FileText className="size-4.5" aria-hidden="true" />}
            label="Reportes"
          />

          <p className="px-3 pt-4 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-text-tertiary">
            EMPRESA
          </p>

          <NavigationItem
            icon={<SettingsIcon className="size-4.5" aria-hidden="true" />}
            label="Configuración"
          />

          <NavigationItem
            icon={<Users className="size-4.5" aria-hidden="true" />}
            label="Perfil"
            href="/profile"
          />
        </nav>
      </Suspense>

      <SidebarUserPlaceholder />
    </aside>
  );
}
