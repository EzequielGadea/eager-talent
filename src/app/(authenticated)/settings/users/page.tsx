import { Suspense } from "react";
import { api } from "~/lib/trpc/server";
import { UsersTable } from "./_components/users-table";
import { UsersTableSkeleton } from "./_components/users-table-skeleton";
import { UsersInviteDialog } from "./_components/users-invite-dialog";

async function UsersContent() {
  const users = await api.user.getAllUsers({});

  return <UsersTable users={users} />;
}

export default function UsersPage() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          Gestioná los usuarios con acceso a EagerTalent
        </p>

        <UsersInviteDialog />
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersContent />
      </Suspense>
    </section>
  );
}
