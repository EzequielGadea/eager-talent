import { Suspense } from "react";
import { Plus } from "lucide-react";

<<<<<<< HEAD
import { buttonVariants } from "~/components/ui/button";
=======
import {Button, buttonVariants } from "~/components/ui/button";
>>>>>>> 44c65e8 (feat: consultar usuarios implementacion del backend y frontend)
import { api } from "~/lib/trpc/server";
import Link from "next/link";
import { UsersTable } from "./_components/users-table";
import { UsersTableSkeleton } from "./_components/users-table-skeleton";
import { cn } from "~/lib/utils";

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

<<<<<<< HEAD
        <Link
          href="/settings/users/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "gap-2 rounded-full bg-dashboard-dark text-text-on-dark hover:bg-dashboard-dark-hover",
          )}
        >
          <Plus size={16} />
          Agregar usuario
        </Link>
=======
       <Link
  href="/settings/users/new"
  className={cn(
    buttonVariants({ size: "sm" }),
    "gap-2 rounded-full bg-dashboard-dark text-text-on-dark hover:bg-dashboard-dark-hover",
  )}
>
  <Plus size={16} />
  Agregar usuario
</Link>
>>>>>>> 44c65e8 (feat: consultar usuarios implementacion del backend y frontend)
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersContent />
      </Suspense>
    </section>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 44c65e8 (feat: consultar usuarios implementacion del backend y frontend)
