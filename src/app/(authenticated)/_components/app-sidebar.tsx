import { ChevronUp, FileText, House, Users } from "lucide-react";
import { Suspense } from "react";
import {
  CurrentUser,
  CurrentUserPlaceholder,
  getCurrentUser,
} from "./app-header";
import { MetricsIcon, SettingsIcon, VacanciesIcon } from "./app-icons";
import { HiringManagerNavigation } from "./hiring-manager-navigation";
import { NavigationItem } from "./navigation-item";
import { UserMenu } from "./user-menu";

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
            <stop offset="0" stopColor="var(--accent-purple)" />
            <stop offset="1" stopColor="var(--accent-green)" />
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

function SidebarUser() {
  return (
    <div className="border-t border-border-default p-2">
      <UserMenu>
        <Suspense fallback={<CurrentUserPlaceholder />}>
          <CurrentUser />
        </Suspense>

        <ChevronUp
          className="size-4 shrink-0 text-text-tertiary"
          aria-hidden="true"
        />
      </UserMenu>
    </div>
  );
}

function RecruiterNavigation() {
  return (
    <>
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
    </>
  );
}

async function SidebarNavigation() {
  const user = await getCurrentUser();

  return (
    <nav
      aria-label="Navegación principal"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3"
    >
      {user?.role === "hiringManager" ? (
        <HiringManagerNavigation />
      ) : (
        <RecruiterNavigation />
      )}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border-default bg-surface-card">
      <EagerTalentBrand />

      <Suspense fallback={<div className="flex-1" />}>
        <SidebarNavigation />
      </Suspense>

      <SidebarUser />
    </aside>
  );
}
