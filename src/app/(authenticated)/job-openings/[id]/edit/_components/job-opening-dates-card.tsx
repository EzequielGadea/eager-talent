"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import { Label } from "~/components/ui/label";
import { Clock3 } from "lucide-react";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import type { UpdateJobOpeningInput } from "~/lib/validations/job-opening";

export function JobOpeningDatesCard() {
  const {
    control,
    formState: { errors },
  } = useFormContext<UpdateJobOpeningInput>();

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

          <Controller
            control={control}
            name="openingDate"
            render={({ field }) => (
              <DatePicker
                id="openingDate"
                name={field.name}
                aria-label="Fecha de apertura"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                isInvalid={!!errors.openingDate}
                className="[--date-picker-height:2.375rem]"
              />
            )}
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

          <Controller
            control={control}
            name="targetClosingDate"
            render={({ field }) => (
              <DatePicker
                id="targetClosingDate"
                name={field.name}
                aria-label="Fecha objetivo de cierre"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                minValue={openingDateValue || undefined}
                isInvalid={!!errors.targetClosingDate}
                className="[--date-picker-height:2.375rem]"
              />
            )}
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
