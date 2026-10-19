import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { auth } from "~/lib/auth";
import { api } from "~/lib/trpc/server";
import { SettingsIcon } from "./app-icons";
import { GlobalSearch } from "./global-search";

import getAvatar from "~/lib/avatar";

// "member" (and a missing membership) intentionally has no label.
const roleLabels: Partial<Record<string, string>> = {
  owner: "Recruiter",
  admin: "Recruiter",
  recruiter: "Recruiter",
  hiringManager: "Hiring Manager",
};

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  return session ? api.user.getCurrent() : null;
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CurrentUserPlaceholder() {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5">
      <div className="size-8.5 shrink-0 rounded-full bg-surface-sunken" />

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3 w-24 rounded-full bg-surface-sunken" />
        <div className="h-2.5 w-16 rounded-full bg-surface-hover" />
      </div>
    </div>
  );
}

type CurrentUserData = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

function CurrentUserDetails({ user }: { user: CurrentUserData }) {
  const fullName = `${user.name} ${user.lastName}`.trim();
  const roleLabel = user.role ? roleLabels[user.role] : undefined;

  const avatar = getAvatar(user.name, user.lastName);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5">
      <Avatar className="size-8.5">
        {user.image && <AvatarImage src={user.image} alt="" />}
        <AvatarFallback className={`${avatar.colorClass}`}>
          {avatar.initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-text-primary">
          {fullName}
        </span>
        {roleLabel && (
          <span className="truncate text-xs text-text-secondary">
            {roleLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export async function CurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    return <CurrentUserPlaceholder />;
  }

  return <CurrentUserDetails user={user} />;
}

async function HeaderUserArea() {
  const user = await getCurrentUser();

  if (user?.role === "hiringManager") {
    return null;
  }

  return (
    <Link
      href="/settings"
      aria-label="Abrir configuración"
      className="flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover"
    >
      <SettingsIcon className="size-4.5" aria-hidden="true" />
    </Link>
  );
}

export function AppHeader() {
  return (
    <header className="flex h-15 shrink-0 items-center gap-4 border-b border-border-default bg-surface-card px-6">
      <GlobalSearch />

      <div className="flex-1" />

      <Suspense fallback={null}>
        <HeaderUserArea />
      </Suspense>
    </header>
  );
}
