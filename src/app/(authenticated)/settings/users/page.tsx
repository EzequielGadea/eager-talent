import { Suspense } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/trpc/server";
import { SettingsShell } from "../_components/settings-shell";
import { UsersTable } from "./_components/users-table";
import { UsersTableSkeleton } from "./_components/users-table-skeleton";
import { UsersInviteDialog } from "./_components/users-invite-dialog";

async function UsersContent() {
  const users = await api.user.getAllUsers({});

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          Gestioná los usuarios con acceso a EagerTalent
        </p>

        <UsersInviteDialog />
      </div>

      <UsersTable users={users} />
    </section>
  );
}

function UsersPageFallback() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>

      <UsersTableSkeleton />
    </section>
  );
}

export default function UsersPage() {
  return (
    <SettingsShell>
      <Suspense fallback={<UsersPageFallback />}>
        <UsersContent />
      </Suspense>
    </SettingsShell>
  );
}
