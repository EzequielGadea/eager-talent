"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItemProps = {
  icon: ReactNode;
  label: string;
  href?: string;
};

export function NavigationItem({ icon, label, href }: NavigationItemProps) {
  const pathname = usePathname();
  const active = href ? pathname === href : false;

  const className = `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm ${
    active
      ? "bg-success-bg font-semibold text-tag-green-fg"
      : "font-medium text-text-secondary hover:bg-slate-50"
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
      <span>{label}</span>
    </Link>
  );
}
