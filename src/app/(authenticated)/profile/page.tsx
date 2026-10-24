import { Suspense } from "react";

import Loading from "~/components/ui/loading";
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
    </div>
  );
}
