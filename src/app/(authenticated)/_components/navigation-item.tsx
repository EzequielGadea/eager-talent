"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItemProps = {
  icon: ReactNode;
  label: string;
  href?: string;
  count?: number;
  // Only the exact href marks the item as active, not its nested routes.
  exact?: boolean;
};

export function NavigationItem({
  icon,
  label,
  href,
  count,
  exact = false,
}: NavigationItemProps) {
  const pathname = usePathname();
  const active = href
    ? pathname === href || (!exact && pathname.startsWith(`${href}/`))
    : false;

  const className = `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm ${
    active
      ? "bg-success-bg font-semibold text-tag-green-fg"
      : "font-medium text-text-secondary hover:bg-surface-hover"
  }`;

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className={`${className} cursor-not-allowed opacity-50`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {icon}
      <span className="min-w-0 truncate">{label}</span>

      {count !== undefined && (
        <span
          className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
            active
              ? "bg-tag-green-bg text-tag-green-fg"
              : "bg-surface-sunken text-text-secondary"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
