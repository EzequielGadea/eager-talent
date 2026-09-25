"use client";

import { JobOpeningFormValues } from "./new-job-opening-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GripVertical, X, Plus, Info, ChevronDown } from "lucide-react";

import { api } from "~/lib/trpc/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export default function OpeningHiring() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

  const stages = [
    { name: "Revisión Inicial" },
    { name: "Entrevista Técnica" },
    { name: "Entrevista Cultural" },
    { name: "Oferta" },
  ];

  const { data: managers, isLoading: isLoadingManager } =
    api.seniority.getAllSeniorities.useQuery({});
  return (
    <Card className="w-full rounded-x1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Hiring Managers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-1">
          <div className="space-y-2">
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingManager}
                >
                  {/*}
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingManager ? "Cargando areas..." : "Seleccionar area"
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
                  </SelectContent>{*/}
                </Select>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
