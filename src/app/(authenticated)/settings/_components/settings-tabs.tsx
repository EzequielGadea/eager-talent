"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Usuarios",
    href: "/settings/users",
  },
  {
    label: "General",
    href: "/settings/general",
  },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border-default">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}

              {isActive && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-accent-green" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}