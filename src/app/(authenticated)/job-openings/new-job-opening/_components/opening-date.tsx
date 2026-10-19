"use client";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Clock } from "lucide-react";

import { DatePicker } from "~/components/ui/date-picker";
import { Label } from "~/components/ui/label";

import { JobOpeningFormValues } from "./new-job-opening-form";

function toDateInputValue(date: Date | null | undefined) {
  return date && !Number.isNaN(date.getTime())
    ? date.toISOString().slice(0, 10)
    : "";
}

function fromDateInputValue(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function differenceInDateDays(startDate: Date, endDate: Date) {
  const start = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
  const end = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
  );

  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export default function OpeningDate() {
  const {
    control,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

  const [openingDate, closingDate] = useWatch({
    control,
    name: ["openingDate", "closingDate"],
  });
  const daysBetweenDates =
    openingDate && closingDate
      ? differenceInDateDays(openingDate, closingDate)
      : null;

  return (
    <Card className="w-full rounded-x1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Fechas{" "}
          <span className="ml-2 align-middle text-xs font-normal text-text-tertiary">
            ambas obligatorias
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="openingDate"
                className="body text-[13px] text-text-secondary"
              >
                Fecha de apertura <span className="text-danger">*</span>
              </Label>

              <Controller
                control={control}
                name="openingDate"
                render={({ field }) => (
                  <DatePicker
                    id="openingDate"
                    name={field.name}
                    aria-label="Fecha de apertura"
                    value={toDateInputValue(field.value)}
                    onChange={(value) =>
                      field.onChange(fromDateInputValue(value))
                    }
                    onBlur={field.onBlur}
                    isInvalid={!!errors.openingDate}
                  />
                )}
              />
              {errors.openingDate && (
                <p className="text-xs text-danger">
                  {errors.openingDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="closingDate"
                className="body text-[13px] text-text-secondary"
              >
                Fecha objetivo de cierre <span className="text-danger">*</span>
              </Label>

              <Controller
                control={control}
                name="closingDate"
                rules={{
                  validate: (value) =>
                    !openingDate ||
                    !value ||
                    value >= openingDate ||
                    "La fecha de cierre no puede ser anterior a la fecha de apertura",
                }}
                render={({ field }) => (
                  <DatePicker
                    id="closingDate"
                    name={field.name}
                    aria-label="Fecha objetivo de cierre"
                    value={toDateInputValue(field.value)}
                    onChange={(value) =>
                      field.onChange(fromDateInputValue(value))
                    }
                    onBlur={field.onBlur}
                    minValue={toDateInputValue(openingDate)}
                    isInvalid={!!errors.closingDate}
                  />
                )}
              />
              {errors.closingDate && (
                <p className="text-xs text-danger">
                  {errors.closingDate.message}
                </p>
              )}
            </div>
          </div>
          {daysBetweenDates !== null && daysBetweenDates >= 0 && (
            <span className="flex w-fit items-center gap-1 rounded-md bg-success-bg px-2 py-1 text-xs font-medium text-text-tertiary">
              <Clock
                className="size-3.5 text-accent-green"
                aria-hidden="true"
              />
              {daysBetweenDates} {daysBetweenDates === 1 ? "día" : "días"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
