"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Calendar, Clock3 } from "lucide-react";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { useFormContext, useWatch } from "react-hook-form";

import type { UpdateJobOpeningInput } from "~/lib/validations/job-opening";
import { useRef } from "react";

export function JobOpeningDatesCard() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateJobOpeningInput>();

  const openingDateInputRef = useRef<HTMLInputElement>(null);
  const targetClosingDateInputRef = useRef<HTMLInputElement>(null);

  const openingDateField = register("openingDate");
  const targetClosingDateField = register("targetClosingDate");

  function openDatePicker(input: HTMLInputElement | null) {
    if (!input) {
      return;
    }

    input.focus();
    input.showPicker?.();
  }

  const openingDateValue = useWatch({
    control,
    name: "openingDate",
  });

  const targetClosingDateValue = useWatch({
    control,
    name: "targetClosingDate",
  });

  const dayCount =
    openingDateValue && targetClosingDateValue
      ? Math.max(
          0,
          differenceInCalendarDays(
            parseISO(targetClosingDateValue),
            parseISO(openingDateValue),
          ),
        )
      : 0;

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-[15px] font-bold tracking-[-0.01em] text-text-primary">
          Fechas
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="openingDate"
            className="text-[13px] font-medium text-text-primary"
          >
            Fecha de apertura
            <span className="ml-1 text-danger">*</span>
          </Label>

          <Input
            id="openingDate"
            type="date"
            className="h-9.5 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2.5 [&::-webkit-calendar-picker-indicator]:opacity-0"
            {...openingDateField}
            ref={(element) => {
              openingDateField.ref(element);
              openingDateInputRef.current = element;
            }}
            iconRight={
              <button
                type="button"
                aria-label="Abrir calendario de fecha de apertura"
                className="flex size-7 cursor-pointer items-center justify-center"
                onClick={() => openDatePicker(openingDateInputRef.current)}
              >
                <Calendar
                  aria-hidden="true"
                  className="size-4 text-text-tertiary"
                />
              </button>
            }
          />
          <p className="min-h-4 text-xs text-danger">
            {errors.openingDate?.message ?? "\u00A0"}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="targetClosingDate"
            className="text-[13px] font-medium text-text-primary"
          >
            Fecha objetivo de cierre
            <span className="ml-1 text-danger">*</span>
          </Label>

          <Input
            id="targetClosingDate"
            type="date"
            min={openingDateValue || undefined}
            className="h-9.5 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2.5 [&::-webkit-calendar-picker-indicator]:opacity-0"
            {...targetClosingDateField}
            ref={(element) => {
              targetClosingDateField.ref(element);
              targetClosingDateInputRef.current = element;
            }}
            iconRight={
              <button
                type="button"
                aria-label="Abrir calendario de fecha objetivo de cierre"
                className="flex size-7 cursor-pointer items-center justify-center"
                onClick={() =>
                  openDatePicker(targetClosingDateInputRef.current)
                }
              >
                <Calendar
                  aria-hidden="true"
                  className="size-4 text-text-tertiary"
                />
              </button>
            }
          />
          <p className="min-h-4 text-xs text-danger">
            {errors.targetClosingDate?.message ?? "\u00A0"}
          </p>
        </div>

        <div className="flex h-9.5 items-center gap-2 rounded-lg border border-tag-green-bg bg-success-bg px-3 text-tag-green-fg md:self-start">
          <Clock3 aria-hidden="true" className="size-4" />
          <span className="whitespace-nowrap text-[13px] font-semibold">
            {dayCount} {dayCount === 1 ? "día" : "días"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
