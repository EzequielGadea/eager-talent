import { Suspense } from "react";
import { redirect } from "next/navigation";
import { z } from "zod";

import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/trpc/server";
import { SettingsShell } from "../_components/settings-shell";
import { UsersTable } from "./_components/users-table";
import { UsersTableSkeleton } from "./_components/users-table-skeleton";
import { UsersInviteDialog } from "./_components/users-invite-dialog";

const usersSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
});

async function UsersContent(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page } = usersSearchParamsSchema.parse(await props.searchParams);
  const { users, total, pageSize } = await api.user.getAllUsers({ page });
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  if (page > lastPage) {
    redirect(`/settings/users?page=${lastPage}`);
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          Gestioná los usuarios con acceso a EagerTalent
        </p>

        <UsersInviteDialog />
      </div>

      <UsersTable
        users={users}
        totalUsers={total}
        pageSize={pageSize}
        currentPage={page}
      />
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

export default function UsersPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <SettingsShell>
      <Suspense fallback={<UsersPageFallback />}>
        <UsersContent searchParams={props.searchParams} />
      </Suspense>
    </SettingsShell>
  );
}
