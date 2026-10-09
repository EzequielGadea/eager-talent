import { Suspense, type ReactNode } from "react";
import { headers } from "next/headers";

import { auth } from "~/lib/auth";

import { SettingsTabs } from "./_components/settings-tabs";
import { SettingsAccessDenied } from "./_components/setting-access-denied";
import { SettingsLayoutSkeleton } from "./_components/settings-layout-skeleton";

async function SettingsContent({ children }: { children: ReactNode }) {
  const canReadUsersResult = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        user: ["read"],
      },
    },
  });

  if (!canReadUsersResult.success) {
    return <SettingsAccessDenied />;
  }

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Configuración
        </h1>
      </div>

      <SettingsTabs />

      {children}
    </main>
  );
}

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SettingsLayoutSkeleton />}>
      <SettingsContent>{children}</SettingsContent>
    </Suspense>
  );
}
