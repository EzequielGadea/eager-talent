"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DropdownProps,
} from "react-day-picker";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

// Replaces the native <select> so the options list is scrollable and uses the
// app font. It still reports changes through a synthetic change event because
// that is what react-day-picker's month/year handlers read.
function CalendarDropdown({
  options,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const items = (options ?? []).map(({ value, label }) => ({ value, label }));

  return (
    <Select
      items={items}
      value={typeof value === "number" ? value : Number(value)}
      disabled={disabled}
      onValueChange={(nextValue) => {
        if (nextValue === null) return;

        onChange?.({
          target: { value: String(nextValue) },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-7 gap-1 border-0 bg-transparent px-2 py-0 text-sm font-semibold text-text-primary transition-colors hover:bg-tag-green-bg hover:text-tag-green-fg focus-visible:ring-2 focus-visible:ring-border-focus dark:bg-transparent dark:hover:bg-tag-green-bg"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        align="center"
        className="max-h-56 min-w-20"
      >
        {(options ?? []).map(({ value: optionValue, label, disabled }) => (
          <SelectPrimitive.Item
            key={optionValue}
            value={optionValue}
            disabled={disabled}
            className="flex w-full cursor-pointer items-center rounded-md px-2 py-1 text-sm text-text-primary outline-hidden select-none not-data-selected:data-highlighted:bg-tag-green-bg not-data-selected:data-highlighted:text-tag-green-fg data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:bg-accent-green data-selected:font-semibold data-selected:text-white data-selected:data-highlighted:bg-accent-green-strong data-selected:data-highlighted:text-white"
          >
            <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
          </SelectPrimitive.Item>
        ))}
      </SelectContent>
    </Select>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  const navButton =
    "pointer-events-auto inline-flex size-(--cell-size) cursor-pointer items-center justify-center rounded-md text-text-secondary outline-none transition-colors select-none hover:bg-tag-green-bg hover:text-tag-green-fg focus-visible:ring-2 focus-visible:ring-border-focus aria-disabled:pointer-events-none aria-disabled:opacity-40";

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn(
        "group/calendar w-fit [--cell-radius:var(--radius-md)] [--cell-size:--spacing(8)]",
        className,
      )}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "pointer-events-none absolute inset-x-0 top-0 flex w-full items-center justify-between",
          defaultClassNames.nav,
        ),
        button_previous: cn(navButton, defaultClassNames.button_previous),
        button_next: cn(navButton, defaultClassNames.button_next),
        month_caption: cn(
          "flex h-(--cell-size) items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) items-center justify-center gap-1.5 text-sm font-semibold text-text-primary",
          defaultClassNames.dropdowns,
        ),
        caption_label: cn(
          "text-sm font-semibold text-text-primary select-none",
          captionLayout !== "label" &&
            "flex items-center gap-1 rounded-md pl-2 [&>svg]:size-3.5 [&>svg]:text-text-tertiary",
          defaultClassNames.caption_label,
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 text-xs font-medium text-text-tertiary capitalize select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          defaultClassNames.day,
        ),
        day_button: cn(
          "flex size-full min-w-(--cell-size) cursor-pointer items-center justify-center rounded-(--cell-radius) text-sm font-medium text-text-primary outline-none transition-colors hover:bg-tag-green-bg hover:text-tag-green-fg focus-visible:ring-2 focus-visible:ring-border-focus",
          "group-data-[selected=true]/day:bg-accent-green group-data-[selected=true]/day:font-semibold group-data-[selected=true]/day:text-white group-data-[selected=true]/day:hover:bg-accent-green-strong group-data-[selected=true]/day:hover:text-white",
          "group-data-[disabled=true]/day:pointer-events-none group-data-[disabled=true]/day:opacity-40",
          defaultClassNames.day_button,
        ),
        today: cn(
          "[&:not([data-selected=true])>button]:bg-surface-sunken [&:not([data-selected=true])>button]:font-semibold [&:not([data-selected=true])>button]:text-accent-green-strong",
          defaultClassNames.today,
        ),
        outside: cn(
          "[&>button]:text-text-tertiary [&>button]:opacity-60",
          defaultClassNames.outside,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Dropdown: CalendarDropdown,
        Chevron: ({ className, orientation, ...chevronProps }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeftIcon
              : orientation === "right"
                ? ChevronRightIcon
                : ChevronDownIcon;

          return <Icon className={cn("size-4", className)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
