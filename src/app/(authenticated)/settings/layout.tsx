import type { ReactNode } from "react";

import { SettingsTabs } from "./_components/settings-tabs";

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
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