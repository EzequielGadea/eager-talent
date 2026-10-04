"use client";
import { useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Clock } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { JobOpeningFormValues } from "./new-job-opening-form";

function toDateInputValue(date: Date | undefined) {
  return date && !Number.isNaN(date.getTime())
    ? date.toISOString().slice(0, 10)
    : undefined;
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
    register,
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
                className="body text-[13px] text-slate-600 --text-primary"
              >
                Fecha de apertura <span className="text-danger">*</span>
              </Label>

              <Input
                type="date"
                id="openingDate"
                placeholder=""
                className="w-full"
                {...register("openingDate", { valueAsDate: true })}
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
                className="body text-[13px] text-slate-600 --text-primary"
              >
                Fecha objetivo de cierre <span className="text-danger">*</span>
              </Label>

              <Input
                type="date"
                placeholder="01/01/2001"
                id="closingDate"
                className="w-full"
                min={toDateInputValue(openingDate)}
                {...register("closingDate", {
                  valueAsDate: true,
                  validate: (value) =>
                    !openingDate ||
                    value >= openingDate ||
                    "La fecha de cierre no puede ser anterior a la fecha de apertura",
                })}
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
