"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Menu, XIcon } from "lucide-react";
import { useState, type MouseEvent, type ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover";

// Links the hamburger in the header with the menu rendered by the sidebar.
const mobileNavigationHandle = PopoverPrimitive.createHandle();

export function MobileNavigationTrigger() {
  return (
    <PopoverTrigger
      handle={mobileNavigationHandle}
      aria-label="Menú de navegación"
      className="group flex size-9 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover data-popup-open:bg-surface-hover md:hidden"
    >
      <Menu
        className="size-5 group-data-popup-open:hidden"
        aria-hidden="true"
      />
      <XIcon
        className="hidden size-5 group-data-popup-open:block"
        aria-hidden="true"
      />
    </PopoverTrigger>
  );
}

type ResponsiveSidebarProps = {
  brand: ReactNode;
  navigation: ReactNode;
  footer: ReactNode;
};

// Receives the server-rendered navigation once and shows it in the fixed
// sidebar from `md` up, and in a dropdown menu below `md`, so roles and
// queries are not duplicated.
export function ResponsiveSidebar({
  brand,
  navigation,
  footer,
}: ResponsiveSidebarProps) {
  const [open, setOpen] = useState(false);

  function closeOnNavigation(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("a[href]")) {
      setOpen(false);
    }
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border-default bg-surface-card md:flex">
        {brand}
        {navigation}
        {footer}
      </aside>

      <Popover
        handle={mobileNavigationHandle}
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverContent
          align="start"
          sideOffset={12}
          className="max-h-[calc(100dvh-5rem)] w-[calc(100vw-2rem)] max-w-sm gap-0 bg-surface-card p-0 py-2 md:hidden"
        >
          <PopoverTitle className="sr-only">Menú de navegación</PopoverTitle>

          <div
            className="flex min-h-0 flex-1 flex-col [&_[data-sidebar-only]]:hidden"
            onClick={closeOnNavigation}
          >
            {navigation}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
