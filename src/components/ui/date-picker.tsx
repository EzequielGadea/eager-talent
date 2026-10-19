"use client";

import {
  Calendar,
  DateField,
  DatePicker as HeroDatePicker,
} from "@heroui/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import {
  type ComponentProps,
  Suspense,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { DateFieldStateContext, I18nProvider } from "react-aria-components";

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

function toCalendarDate(value?: string | null) {
  if (!value) return null;

  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

// Field height and radius can be overridden per usage through the
// --date-picker-height and --date-picker-radius CSS variables.
const fieldSize =
  "h-[var(--date-picker-height,2.5rem)] rounded-[var(--date-picker-radius,var(--radius-lg))]";

const styles = {
  root: "inline-flex w-full flex-col gap-1",
  group: cn(
    "inline-flex w-full items-center overflow-hidden border border-border-default bg-surface-card text-sm text-text-primary outline-none transition-[border-color,box-shadow] duration-150",
    fieldSize,
    "not-data-[invalid=true]:data-[hovered=true]:not-focus-within:border-border-strong",
    "focus-within:border-border-focus focus-within:ring-4 focus-within:ring-border-focus/20",
    "data-[invalid=true]:border-danger data-[invalid=true]:focus-within:ring-danger/20",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
  ),
  input: "flex flex-1 cursor-text items-center gap-px px-3 outline-none",
  segment: cn(
    "inline-block rounded-sm px-0.5 text-end text-nowrap outline-none",
    "data-[type=literal]:px-0 data-[type=literal]:text-text-tertiary",
    "data-[placeholder=true]:text-text-tertiary",
    "focus:bg-tag-green-bg focus:text-tag-green-fg focus:data-[placeholder=true]:text-tag-green-fg",
    "data-[invalid=true]:text-danger data-[invalid=true]:focus:bg-danger-bg data-[invalid=true]:focus:text-danger",
  ),
  suffix: "me-2 flex shrink-0 items-center text-text-tertiary",
  trigger: cn(
    "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-text-tertiary outline-none transition-colors",
    "data-[hovered=true]:bg-tag-green-bg data-[hovered=true]:text-tag-green-fg",
    "data-[pressed=true]:bg-tag-green-bg data-[pressed=true]:text-tag-green-fg",
    "aria-expanded:bg-tag-green-bg aria-expanded:text-tag-green-fg",
    "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-border-focus",
  ),
  triggerIndicator: "inline-flex size-4 items-center justify-center",
  popover: cn(
    "w-fit origin-(--trigger-anchor-point) overflow-y-auto overscroll-contain rounded-xl border border-border-default bg-popover p-3 text-popover-foreground shadow-lg outline-none",
    "data-[entering=true]:animate-in data-[entering=true]:duration-150 data-[entering=true]:fade-in-0 data-[entering=true]:zoom-in-95",
    "data-[exiting=true]:pointer-events-none data-[exiting=true]:animate-out data-[exiting=true]:duration-100 data-[exiting=true]:fade-out data-[exiting=true]:zoom-out-95",
  ),
  calendar: "group/calendar relative w-63 max-w-63",
  header: "flex items-center justify-between gap-1 px-0.5 pb-3",
  yearTrigger: cn(
    "group/year flex flex-1 cursor-pointer items-center justify-start gap-1 rounded-md outline-none",
    "focus-visible:ring-2 focus-visible:ring-border-focus",
  ),
  yearTriggerHeading: cn(
    "text-sm font-semibold text-text-primary transition-colors",
    "group-data-[open=true]/year:text-accent-green-strong",
  ),
  yearTriggerIndicator: cn(
    "text-xs text-accent-green-strong transition-transform",
    "group-data-[open=true]/year:rotate-90",
  ),
  navButton: cn(
    "flex size-7 cursor-pointer items-center justify-center rounded-md text-text-secondary outline-none transition-[background-color,color,opacity] [&_svg]:size-4",
    "data-[hovered=true]:bg-tag-green-bg data-[hovered=true]:text-tag-green-fg",
    "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-border-focus",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
    "group-has-[[data-slot=calendar-year-picker-grid][data-open=true]]/calendar:pointer-events-none group-has-[[data-slot=calendar-year-picker-grid][data-open=true]]/calendar:opacity-0",
  ),
  grid: cn(
    "grid w-full grid-cols-7 transition-[opacity,visibility] duration-150",
    "group-has-[[data-slot=calendar-year-picker-grid][data-open=true]]/calendar:pointer-events-none group-has-[[data-slot=calendar-year-picker-grid][data-open=true]]/calendar:invisible group-has-[[data-slot=calendar-year-picker-grid][data-open=true]]/calendar:opacity-0",
  ),
  gridSection: "contents [&>tr]:contents [&>tr:first-child>td]:mt-1",
  headerCell:
    "flex items-center justify-center pb-2 text-xs font-medium text-text-tertiary",
  cell: cn(
    "relative flex aspect-square size-full cursor-pointer items-center justify-center rounded-lg text-center text-sm font-medium text-text-primary outline-none transition-colors",
    "not-data-[selected=true]:data-[hovered=true]:bg-tag-green-bg not-data-[selected=true]:data-[hovered=true]:text-tag-green-fg",
    "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-border-focus",
    "data-[today=true]:font-semibold not-data-[selected=true]:data-[today=true]:bg-surface-sunken not-data-[selected=true]:data-[today=true]:text-accent-green-strong",
    "data-[selected=true]:bg-accent-green data-[selected=true]:font-semibold data-[selected=true]:text-white data-[selected=true]:data-[hovered=true]:bg-accent-green-strong",
    "data-[outside-month=true]:text-text-tertiary data-[outside-month=true]:opacity-50",
    "data-[unavailable=true]:pointer-events-none data-[unavailable=true]:opacity-40",
    "not-data-[outside-month=true]:data-[disabled=true]:pointer-events-none not-data-[outside-month=true]:data-[disabled=true]:line-through not-data-[outside-month=true]:data-[disabled=true]:opacity-40",
  ),
  yearGrid: cn(
    "pointer-events-none absolute inset-x-0 grid grid-cols-3 content-start gap-1 overflow-y-auto p-1 opacity-0",
    "data-[open=true]:pointer-events-auto data-[open=true]:opacity-100 data-[open=true]:transition-opacity data-[open=true]:delay-50 data-[open=true]:duration-200",
  ),
  yearCell: cn(
    "relative inline-flex h-8 cursor-pointer items-center justify-center rounded-lg px-2.5 text-sm font-medium text-text-primary outline-none transition-colors select-none",
    "not-data-[selected=true]:not-aria-selected:data-[hovered=true]:bg-tag-green-bg not-data-[selected=true]:not-aria-selected:data-[hovered=true]:text-tag-green-fg",
    "data-[selected=true]:bg-accent-green data-[selected=true]:text-white aria-selected:bg-accent-green aria-selected:text-white",
    "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-border-focus",
  ),
};

// React Aria reads the current date on render, which Cache Components
// disallows during prerender, so the field streams in behind a Suspense boundary.
function DatePickerFallback({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full border border-border-default bg-surface-card",
          fieldSize,
        )}
      />
    </div>
  );
}

const SEGMENT_DIGITS = { day: 2, month: 2, year: 4 } as const;

// React Aria only commits a date once every segment is filled, so clearing a
// segment leaves the previous date in its value. The segments are the source
// of truth instead: the date is "" unless all three are filled and form a real date.
function DateSegment({
  segment,
  hasMounted,
  onDateChange,
}: {
  segment: ComponentProps<typeof DateField.Segment>["segment"];
  hasMounted: boolean;
  onDateChange: (value: string) => void;
}) {
  const state = useContext(DateFieldStateContext);
  const notifyDateChange = useEffectEvent(onDateChange);
  const [day, month, year] = (["day", "month", "year"] as const).map((type) =>
    state?.segments.find((item) => item.type === type),
  );

  let isoDate = "";

  if (
    day &&
    month &&
    year &&
    ![day, month, year].some((s) => s.isPlaceholder)
  ) {
    const date = new CalendarDate(year.value!, month.value!, day.value!);

    if (date.day === day.value && date.month === month.value) {
      isoDate = date.toString();
    }
  }

  const isReporter = segment.type === "year";

  useEffect(() => {
    if (isReporter) notifyDateChange(isoDate);
  }, [isReporter, isoDate]);

  const digits =
    hasMounted && !segment.isPlaceholder && segment.type in SEGMENT_DIGITS
      ? SEGMENT_DIGITS[segment.type as keyof typeof SEGMENT_DIGITS]
      : 0;

  return (
    <DateField.Segment
      segment={{ ...segment, text: segment.text.padStart(digits, "0") }}
      className={styles.segment}
    />
  );
}

function DatePicker({
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
  "aria-label": ariaLabel = "Fecha",
  "aria-labelledby": ariaLabelledBy,
}: DatePickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [syncedDate, setSyncedDate] = useState(value ?? "");
  const [resetKey, setResetKey] = useState(0);
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // The field keeps its own (possibly partial) text, so it is only remounted
  // when the form changes the value from outside, e.g. a reset.
  if ((value ?? "") !== syncedDate) {
    setSyncedDate(value ?? "");
    setResetKey((key) => key + 1);
  }

  const handleDateChange = (nextDate: string) => {
    if (nextDate === syncedDate) return;

    setSyncedDate(nextDate);
    onChange?.(nextDate);
  };

  return (
    <Suspense fallback={<DatePickerFallback className={className} />}>
      <I18nProvider locale="es-UY">
        <HeroDatePicker
          key={resetKey}
          id={id}
          name={name}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          defaultValue={toCalendarDate(value)}
          onBlur={onBlur}
          minValue={toCalendarDate(minValue)}
          maxValue={toCalendarDate(maxValue)}
          isInvalid={isInvalid}
          isDisabled={isDisabled}
          shouldForceLeadingZeros
          data-slot="date-picker"
          className={cn(styles.root, className)}
        >
          <I18nProvider locale="en-GB">
            <DateField.Group fullWidth className={styles.group}>
              <DateField.Input className={styles.input}>
                {(segment) => (
                  <DateSegment
                    segment={segment}
                    hasMounted={hasMounted}
                    onDateChange={handleDateChange}
                  />
                )}
              </DateField.Input>
              <DateField.Suffix className={styles.suffix}>
                <HeroDatePicker.Trigger
                  ref={triggerRef}
                  className={styles.trigger}
                >
                  <HeroDatePicker.TriggerIndicator
                    className={styles.triggerIndicator}
                  />
                </HeroDatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
          </I18nProvider>
          <HeroDatePicker.Popover
            triggerRef={triggerRef}
            placement="bottom end"
            offset={8}
            className={styles.popover}
          >
            <Calendar aria-label={ariaLabel} className={styles.calendar}>
              <Calendar.Header className={styles.header}>
                <Calendar.YearPickerTrigger className={styles.yearTrigger}>
                  <Calendar.YearPickerTriggerHeading
                    className={styles.yearTriggerHeading}
                  />
                  <Calendar.YearPickerTriggerIndicator
                    className={styles.yearTriggerIndicator}
                  />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton
                  slot="previous"
                  className={styles.navButton}
                />
                <Calendar.NavButton slot="next" className={styles.navButton} />
              </Calendar.Header>
              <Calendar.Grid className={styles.grid}>
                <Calendar.GridHeader className={styles.gridSection}>
                  {(day) => (
                    <Calendar.HeaderCell className={styles.headerCell}>
                      {day}
                    </Calendar.HeaderCell>
                  )}
                </Calendar.GridHeader>
                <Calendar.GridBody className={styles.gridSection}>
                  {(date) => (
                    <Calendar.Cell date={date} className={styles.cell} />
                  )}
                </Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid className={styles.yearGrid}>
                <Calendar.YearPickerGridBody>
                  {({ year }) => (
                    <Calendar.YearPickerCell
                      year={year}
                      className={styles.yearCell}
                    />
                  )}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
          </HeroDatePicker.Popover>
        </HeroDatePicker>
      </I18nProvider>
    </Suspense>
  );
}

export { DatePicker };
export type { DatePickerProps };
