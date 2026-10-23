"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  DateField,
  DateFieldStateContext,
  DateInput,
  DateSegment,
  I18nProvider,
} from "react-aria-components";
import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";

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
  ref?: React.Ref<{ focus: () => void }>;
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

function isoToDate(iso?: string | null) {
  return isoToCalendarDate(iso)?.toDate(getLocalTimeZone());
}

function isoToCalendarDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return parseDate(iso);
  } catch {
    return null;
  }
}

// Field height and radius can be overridden per usage through the
// --date-picker-height and --date-picker-radius CSS variables.
const fieldClassName = cn(
  "flex h-[var(--date-picker-height,2.5rem)] w-full items-center rounded-[var(--date-picker-radius,var(--radius-lg))] border border-border-default bg-surface-card text-sm text-text-primary transition-[border-color,box-shadow] duration-150",
  "hover:not-focus-within:border-border-strong",
  "focus-within:border-border-focus focus-within:ring-4 focus-within:ring-border-focus/20",
  "data-[invalid]:border-danger data-[invalid]:focus-within:ring-danger/20",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
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
  const earliest = [defaultStart, selected, maxDate].filter(
    (date) => date !== undefined,
  );
  const latest = [defaultEnd, selected, minDate].filter(
    (date) => date !== undefined,
  );
  const startMonth =
    minDate ?? new Date(Math.min(...earliest.map((date) => date.getTime())));
  const endMonth =
    maxDate ?? new Date(Math.max(...latest.map((date) => date.getTime())));

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

const segmentClassName = cn(
  "inline-block rounded-sm px-0.5 text-end text-nowrap outline-none",
  "data-[type=literal]:px-0 data-[type=literal]:text-text-tertiary",
  "data-placeholder:text-text-tertiary",
  "data-focused:bg-tag-green-bg data-focused:text-tag-green-fg data-focused:data-placeholder:text-tag-green-fg",
  "data-invalid:text-danger data-invalid:data-focused:bg-danger-bg data-invalid:data-focused:text-danger",
);

// React Aria keeps the previous date when a segment is cleared, so the form
// value is derived from the segments: empty unless they form a real date.
function DatePickerSegment({
  segment,
  onDateChange,
}: {
  segment: React.ComponentProps<typeof DateSegment>["segment"];
  onDateChange: (value: string) => void;
}) {
  const state = useContext(DateFieldStateContext);
  const part = (type: string) => {
    const item = state?.segments.find((segment) => segment.type === type);
    return item?.isPlaceholder ? undefined : item?.value;
  };
  const [day, month, year] = [part("day"), part("month"), part("year")];
  const date = day && month && year ? new CalendarDate(year, month, day) : null;
  // CalendarDate constrains impossible dates (31/02), so compare with the typed text.
  const isoDate =
    date?.day === day && date?.month === month ? (date?.toString() ?? "") : "";
  const isReporter = segment.type === "year";

  useEffect(() => {
    if (isReporter) onDateChange(isoDate);
  }, [isReporter, isoDate, onDateChange]);

  return <DateSegment segment={segment} className={segmentClassName} />;
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  ref,
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
  const [open, setOpen] = useState(false);
  const [syncedDate, setSyncedDate] = useState(value ?? "");
  const [resetKey, setResetKey] = useState(0);
  const fieldRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () =>
      fieldRef.current
        ?.querySelector<HTMLElement>("[role=spinbutton]")
        ?.focus(),
  }));

  // The field keeps its own (possibly partial) text, so it is only remounted
  // when the form changes the value from outside, e.g. a reset or the calendar.
  if ((value ?? "") !== syncedDate) {
    setSyncedDate(value ?? "");
    setResetKey((key) => key + 1);
  }

  function handleDateChange(nextDate: string) {
    if (nextDate === syncedDate) return;

    setSyncedDate(nextDate);
    onChange?.(nextDate);
  }

  function handleSelect(selected: Date | undefined) {
    if (!selected) return;

    onChange?.(format(selected, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <I18nProvider locale="es-AR">
      <DateField
        ref={fieldRef}
        id={id}
        name={name}
        key={resetKey}
        defaultValue={isoToCalendarDate(value)}
        shouldForceLeadingZeros
        onBlur={onBlur}
        isInvalid={isInvalid || undefined}
        isDisabled={isDisabled}
        validationBehavior="aria"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(fieldClassName, className)}
      >
        <DateInput className="flex h-full min-w-0 flex-1 cursor-text items-center gap-px px-3 outline-none">
          {(segment) => (
            <DatePickerSegment
              segment={segment}
              onDateChange={handleDateChange}
            />
          )}
        </DateInput>

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
              selected={isoToDate(value)}
              minDate={isoToDate(minValue)}
              maxDate={isoToDate(maxValue)}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
      </DateField>
    </I18nProvider>
  );
}
