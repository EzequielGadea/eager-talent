"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

type DatePickerProps = {
  /** ISO date string (yyyy-MM-dd). Empty string or null means no date. */
  value?: string | null;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  /** ISO date string (yyyy-MM-dd). */
  minValue?: string | null;
  /** ISO date string (yyyy-MM-dd). */
  maxValue?: string | null;
  isInvalid?: boolean;
  isDisabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const MIN_YEAR = 1900;

function isoToDate(iso?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!match) return undefined;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function isoToText(iso?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");

  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

// Returns null when the text is not a real calendar date (e.g. 31/02/2025).
function textToIso(text: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isReal =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return isReal && Number(year) >= MIN_YEAR ? `${year}-${month}-${day}` : null;
}

function maskDigits(digits: string) {
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter(Boolean)
    .join("/");
}

// Field height and radius can be overridden per usage through the
// --date-picker-height and --date-picker-radius CSS variables.
const fieldClassName = cn(
  "flex h-[var(--date-picker-height,2.5rem)] w-full items-center rounded-[var(--date-picker-radius,var(--radius-lg))] border border-border-default bg-surface-card text-sm text-text-primary transition-[border-color,box-shadow] duration-150",
  "hover:not-focus-within:border-border-strong",
  "focus-within:border-border-focus focus-within:ring-4 focus-within:ring-border-focus/20",
  "data-[invalid=true]:border-danger data-[invalid=true]:focus-within:ring-danger/20",
  "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
);

// Rendered only while the popover is open: reading the current date during
// prerender is not allowed with Cache Components.
function DatePickerCalendar({
  selected,
  minDate,
  maxDate,
  onSelect,
}: {
  selected?: Date;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date | undefined) => void;
}) {
  const currentYear = new Date().getFullYear();
  const defaultStart = new Date(currentYear - 5, 0);
  const defaultEnd = new Date(currentYear + 20, 11);
  const startMonth =
    minDate ?? (selected && selected < defaultStart ? selected : defaultStart);
  const endMonth =
    maxDate ?? (selected && selected > defaultEnd ? selected : defaultEnd);

  return (
    <Calendar
      mode="single"
      locale={es}
      formatters={{
        formatMonthDropdown: (month) => {
          const label = format(month, "LLL", { locale: es });
          return `${label.charAt(0).toUpperCase()}${label.slice(1)}.`;
        },
      }}
      weekStartsOn={1}
      captionLayout="dropdown"
      startMonth={startMonth}
      endMonth={endMonth}
      defaultMonth={selected ?? minDate}
      selected={selected}
      onSelect={onSelect}
      disabled={[
        ...(minDate ? [{ before: minDate }] : []),
        ...(maxDate ? [{ after: maxDate }] : []),
      ]}
    />
  );
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  name,
  id,
  minValue,
  maxValue,
  isInvalid,
  isDisabled,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: DatePickerProps) {
  const [text, setText] = useState(() => isoToText(value));
  const [open, setOpen] = useState(false);
  const [lastValue, setLastValue] = useState(value);

  // Follow external value changes (form reset, programmatic updates) unless
  // they are just the echo of what the user is currently typing.
  if (value !== lastValue) {
    setLastValue(value);
    if ((value ?? "") !== (textToIso(text) ?? "")) setText(isoToText(value));
  }

  const iso = textToIso(text);
  const isOutOfRange =
    !!iso && ((!!minValue && iso < minValue) || (!!maxValue && iso > maxValue));
  const invalid =
    !!isInvalid || isOutOfRange || (text.length === 10 && iso === null);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const previousDigits = text.replace(/\D/g, "");
    let digits = event.target.value.replace(/\D/g, "").slice(0, 8);

    // Deleting a "/" leaves the digits untouched, so remove the previous digit.
    const isDeleting = (event.nativeEvent as InputEvent).inputType?.startsWith(
      "delete",
    );
    if (isDeleting && digits.length === previousDigits.length) {
      digits = digits.slice(0, -1);
    }

    const nextText = maskDigits(digits);
    setText(nextText);
    onChange?.(textToIso(nextText) ?? "");
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return;

    const nextIso = format(date, "yyyy-MM-dd");
    setText(isoToText(nextIso));
    onChange?.(nextIso);
    setOpen(false);
  }

  return (
    <div
      data-invalid={invalid || undefined}
      data-disabled={isDisabled || undefined}
      className={cn(fieldClassName, className)}
    >
      <input
        id={id}
        name={name}
        value={text}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={isDisabled}
        inputMode="numeric"
        autoComplete="off"
        placeholder="DD/MM/AAAA"
        maxLength={10}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid || undefined}
        className="h-full min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-text-tertiary"
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={isDisabled}
          aria-label="Abrir calendario"
          className="me-2 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-tertiary outline-none transition-colors hover:bg-tag-green-bg hover:text-tag-green-fg focus-visible:ring-2 focus-visible:ring-border-focus aria-expanded:bg-tag-green-bg aria-expanded:text-tag-green-fg"
        >
          <CalendarIcon className="size-4" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-fit p-3">
          <DatePickerCalendar
            selected={isoToDate(iso ?? value)}
            minDate={isoToDate(minValue)}
            maxDate={isoToDate(maxValue)}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
