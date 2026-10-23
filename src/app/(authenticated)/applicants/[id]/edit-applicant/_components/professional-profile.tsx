"use client";

import { Controller, useFormContext } from "react-hook-form";

import { api } from "~/lib/trpc/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import type { ApplicantFormValues } from "./edit-applicant-form";

import { EnglishLevel } from "~/generated/prisma/enums";
import { englishLevelTranslations } from "~/lib/enum-translations";

export default function ProfessionalProfile() {
  const englishLevels = Object.values(EnglishLevel).map((englishLevel) => ({
    value: englishLevel,
    label: englishLevelTranslations[englishLevel],
  }));

  const {
    control,
    formState: { errors },
  } = useFormContext<ApplicantFormValues>();

  const { data: areas, isLoading: isLoadingArea } =
    api.area.getAllAreas.useQuery({});

  const { data: roles, isLoading: isLoadingRole } =
    api.jobRole.getAllRoles.useQuery({});

  const { data: seniorities, isLoading: isLoadingSeniority } =
    api.seniority.getAllSeniorities.useQuery({});

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="gap-1 pb-3">
        <CardTitle className="text-sm font-semibold">
          Perfil profesional
        </CardTitle>

        <p className="text-xs text-text-secondary">
          El Rol es el perfil del candidato.
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>
              Rol <span className="text-danger">*</span>
            </Label>

            {isLoadingRole ? (
              <Skeleton className="h-8 w-full rounded-lg" />
            ) : (
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar rol">
                        {roles?.find((rol) => rol.id === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="">Sin seleccionar</SelectItem>
                      {roles?.map((rol) => (
                        <SelectItem key={rol.id} value={rol.id}>
                          {rol.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.role && (
              <p className="text-danger">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Seniority</Label>

            {isLoadingSeniority ? (
              <Skeleton className="h-8 w-full rounded-lg" />
            ) : (
              <Controller
                name="seniority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar seniority">
                        {
                          seniorities?.find(
                            (seniority) => seniority.id === field.value,
                          )?.name
                        }
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="">Sin seleccionar</SelectItem>

                      {seniorities?.map((seniority) => (
                        <SelectItem key={seniority.id} value={seniority.id}>
                          {seniority.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>

          <div className="space-y-1">
            <Label>Área</Label>

            {isLoadingArea ? (
              <Skeleton className="h-8 w-full rounded-lg" />
            ) : (
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar area">
                        {areas?.find((area) => area.id === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="">Sin seleccionar</SelectItem>
                      {areas?.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>

          <div className="space-y-1">
            <Label>Nivel de inglés</Label>

            <Controller
              name="englishLevel"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar nivel">
                      {field.value
                        ? englishLevelTranslations[field.value]
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="">Sin seleccionar</SelectItem>
                    {englishLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
