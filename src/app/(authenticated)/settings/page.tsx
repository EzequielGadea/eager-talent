import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SettingsLayoutSkeleton } from "./_components/settings-layout-skeleton";

function SettingsRedirect() {
  return redirect("/settings/users");
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLayoutSkeleton />}>
      <SettingsRedirect />
    </Suspense>
  );
}
