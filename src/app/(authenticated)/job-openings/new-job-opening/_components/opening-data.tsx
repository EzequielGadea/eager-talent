"use client";

import { Upload, X } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { api } from "~/lib/trpc/react";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import {
  Attachment,
  AttachmentAction,
  AttachmentMedia,
} from "~/components/ui/attachment";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { JobOpeningFormValues } from "./new-job-opening-form";

import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Field } from "@base-ui/react";
import { JobOpeningStatus } from "~/generated/prisma/enums";

export default function OpeningData() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

  const { data: areas, isLoading: isLoadingArea } =
    api.area.getAllAreas.useQuery({});

  return (
    <Card className="w-full rounded-x1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Datos de la vacante
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label
              htmlFor="name"
              className="body text-[13px] text-slate-600 --text-primary"
            >
              Nombre de la vacante <span className="text-danger">*</span>
            </Label>

            <Input
              id="name"
              placeholder="Ej. Sr. Node js Developer"
              className="w-full"
            />
            {/*errors.name && (
                            <p className="text-danger">{errors.name.message}</p>
                        )*/}
          </div>
          <div className="space-y-1">
            <Label htmlFor="area">
              Area <span className="text-danger">*</span>
            </Label>
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingArea}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingArea ? "Cargando areas..." : "Seleccionar area"
                      }
                    >
                      {areas?.find((areas) => areas.id === field.value)?.name}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value=""> Sin seleccionar</SelectItem>
                    {areas?.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="status">Estado</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  value={field.value ? [field.value] : []}
                  onValueChange={(values) => {
                    const value = values[0];

                    if (value) {
                      field.onChange(value);
                    }
                  }}
                  spacing={1}
                  aria-label="Estado de la vacante"
                  className="flex w-full rounded-lg border border-border-default bg-surface-sunken p-1"
                >
                  <ToggleGroupItem
                    value={JobOpeningStatus.Open}
                    className="flex-1 rounded-md bg-surface-sunken text-[13px] font-medium text-text-secondary transition-all hover:bg-surface-hover data-pressed:bg-card data-pressed:text-accent-green-strong data-pressed:shadow-sm"
                  >
                    Abierta
                  </ToggleGroupItem>

                  <ToggleGroupItem
                    value={JobOpeningStatus.Paused}
                    className="flex-1 rounded-md bg-surface-sunken text-[13px] font-medium text-text-secondary transition-all hover:bg-surface-hover data-pressed:bg-card data-pressed:text-accent-green-strong data-pressed:shadow-sm"
                  >
                    Pausada
                  </ToggleGroupItem>

                  <ToggleGroupItem
                    value={JobOpeningStatus.Closed}
                    className="flex-1 rounded-md bg-surface-sunken text-[13px] font-medium text-text-secondary transition-all hover:bg-surface-hover data-pressed:bg-card data-pressed:text-accent-green-strong data-pressed:shadow-sm"
                  >
                    Cerrada
                  </ToggleGroupItem>

                  <ToggleGroupItem
                    value={JobOpeningStatus.Cancelled}
                    className="flex-1 rounded-md bg-surface-sunken text-[13px] font-medium text-text-secondary transition-all hover:bg-surface-hover data-pressed:bg-card data-pressed:text-accent-green-strong data-pressed:shadow-sm"
                  >
                    Cancelada
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
