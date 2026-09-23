"use client";
import { Controller, useFormContext } from "react-hook-form";
import { api } from "~/lib/trpc/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Check, Circle, CircleDot } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { JobOpeningFormValues } from "./new-job-opening-form";

import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { JobOpeningStatus } from "~/generated/prisma/enums";

export default function OpeningDate() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

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
            />
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
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
