import { Suspense } from "react";

import Loading from "~/components/ui/loading";
import { ChangePasswordDialog } from "./_components/change-password-dialog";
import { LogoutButton } from "./_components/logout-button";
import { ProfileDetails } from "./_components/profile-details";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold text-text-primary">
          Mi perfil
        </h1>
        <p className="text-sm text-text-secondary">
          Información asociada a tu cuenta.
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <ProfileDetails />
      </Suspense>

      <section className="space-y-4 rounded-xl border border-border-default bg-surface-card p-6 shadow-sm">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
          Cuenta
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChangePasswordDialog />
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
