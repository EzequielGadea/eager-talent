"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Check } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import type { UpdateJobOpeningInput } from "~/lib/validations/job-opening";

type JobOpeningDetailsCardProps = {
  areaOptions: Array<{
    id: string;
    name: string;
  }>;

  seniorityOptions: Array<{
    id: string;
    name: string;
  }>;
};

const LOCATION_OPTIONS: UpdateJobOpeningInput["location"][] = [
  "Uruguay",
  "Argentina",
  "Indiferente",
];

export function JobOpeningDetailsCard({
  areaOptions,
  seniorityOptions,
}: JobOpeningDetailsCardProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateJobOpeningInput>();

  const areaItems = areaOptions.map((area) => ({
    value: area.id,
    label: area.name,
  }));

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-[15px] font-bold tracking-[-0.01em] text-text-primary">
          Datos de la vacante
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label
            htmlFor="name"
            className="text-sm font-medium text-text-primary"
          >
            Nombre de la vacante
            <span className="ml-1 text-danger">*</span>
          </Label>

          <Input
            id="name"
            className="h-9.5"
            errorMessage={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="area"
            className="text-[13px] font-medium text-text-primary"
          >
            Area
            <span className="ml-1 text-danger">*</span>
          </Label>

          <Controller
            control={control}
            name="areaId"
            render={({ field, fieldState }) => (
              <>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  items={areaItems}
                >
                  <SelectTrigger
                    id="area"
                    className="h-9.5 w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {areaItems.map((area) => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {fieldState.error && (
                  <p className="text-xs text-danger">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-[13px] font-medium text-text-primary">
            Estado
            <span className="ml-1 text-danger">*</span>
          </legend>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <ToggleGroup
                value={[field.value]}
                onValueChange={(values) => {
                  const nextStatus = values[0];

                  if (nextStatus) {
                    field.onChange(nextStatus);
                  }
                }}
                size="sm"
                spacing={1}
                className="w-full rounded-lg border border-border-default bg-muted p-1"
              >
                <ToggleGroupItem
                  value="Open"
                  className="flex-1 text-text-secondary hover:bg-transparent aria-pressed:bg-card aria-pressed:text-tag-green-fg aria-pressed:shadow-sm"
                >
                  Abierta
                </ToggleGroupItem>

                <ToggleGroupItem
                  value="Paused"
                  className="flex-1 text-text-secondary hover:bg-transparent aria-pressed:bg-card aria-pressed:text-tag-green-fg aria-pressed:shadow-sm"
                >
                  Pausada
                </ToggleGroupItem>

                <ToggleGroupItem
                  value="Closed"
                  className="flex-1 text-text-secondary hover:bg-transparent aria-pressed:bg-card aria-pressed:text-tag-green-fg aria-pressed:shadow-sm"
                >
                  Cerrada
                </ToggleGroupItem>

                <ToggleGroupItem
                  value="Cancelled"
                  className="flex-1 text-text-secondary hover:bg-transparent aria-pressed:bg-card aria-pressed:text-tag-green-fg aria-pressed:shadow-sm"
                >
                  Cancelada
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-[13px] font-medium text-text-primary">
            Seniority
            <span className="ml-1 text-danger">*</span>
            <span className="ml-1 font-normal text-text-tertiary">
              (uno o varios)
            </span>
          </legend>

          <Controller
            control={control}
            name="seniorityIds"
            render={({ field, fieldState }) => (
              <>
                <ToggleGroup
                  multiple
                  value={field.value}
                  onValueChange={field.onChange}
                  variant="outline"
                  size="sm"
                  spacing={2}
                  className="flex-wrap justify-start"
                >
                  {seniorityOptions.map((seniority) => (
                    <ToggleGroupItem
                      key={seniority.id}
                      value={seniority.id}
                      className="rounded-full px-3 text-text-secondary aria-pressed:border-accent-green aria-pressed:bg-success-bg aria-pressed:text-tag-green-fg"
                    >
                      <Check
                        data-icon="inline-start"
                        aria-hidden="true"
                        className="hidden group-aria-pressed/toggle:block"
                      />

                      {seniority.name}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                {fieldState.error && (
                  <p className="text-xs text-danger">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-[13px] font-medium text-text-primary">
            Ubicación
            <span className="ml-1 text-danger">*</span>
          </legend>

          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <ToggleGroup
                value={[field.value]}
                onValueChange={(values) => {
                  const nextLocation = values[0];

                  if (nextLocation) {
                    field.onChange(nextLocation);
                  }
                }}
                variant="outline"
                size="sm"
                spacing={2}
                className="flex-wrap justify-start"
              >
                {LOCATION_OPTIONS.map((location) => (
                  <ToggleGroupItem
                    key={location}
                    value={location}
                    className="rounded-full px-3 text-text-secondary aria-pressed:border-accent-green aria-pressed:bg-success-bg aria-pressed:text-tag-green-fg"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-3.5 items-center justify-center rounded-full border border-border-strong group-data-pressed/toggle:border-tag-green-fg"
                    >
                      <span className="hidden size-1.5 rounded-full bg-tag-green-fg group-data-pressed/toggle:block" />
                    </span>

                    {location}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </fieldset>
      </CardContent>
    </Card>
  );
}
