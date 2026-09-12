"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import { api } from "~/lib/trpc/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import type { CandidateFormValues } from "./new-candidate-form";

import { EnglishLevel } from "~/generated/prisma/enums";

export default function ProfessionalProfile() {
  const englishLevels = Object.values(EnglishLevel).map((englishLevel) => ({
    value: englishLevel,
    label: englishLevel,
  }));

  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CandidateFormValues>();

  const { data: areas, isLoading: isLoadingArea } =
    api.area.getAllAreas.useQuery({});

  const { data: roles, isLoading: isLoadingRole } =
    api.role.getAllRoles.useQuery({});

  const { data: seniorities, isLoading: isLoadingSeniority } =
    api.seniority.getAllSeniorities.useQuery({});

  const { data: jobOpenings, isLoading: isLoadingJobOpening } =
    api.jobOpening.getAllJobOpenings.useQuery({});

  const jobOpening = useWatch({
    control,
    name: "jobOpening",
  });

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="gap-1 pb-3">
        <CardTitle className="text-sm font-semibold">
          Perfil profesional
        </CardTitle>

        <p className="text-xs text-text-secondary">
          El Rol es el perfil del candidato. La Vacante es opcional.
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>
              Rol <span className="text-danger">*</span>
            </Label>

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingRole}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingRole
                          ? "Cargando roles..."
                          : "Seleccionar roles"
                      }
                    >
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
            {errors.role && (
              <p className="text-danger">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Vacante</Label>

            <Controller
              name="jobOpening"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingJobOpening}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingJobOpening
                          ? "Cargando vacantes..."
                          : "Seleccionar vacante"
                      }
                    >
                      {
                        jobOpenings?.find(
                          (jobOpening) => jobOpening.id === field.value,
                        )?.name
                      }
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="">Sin seleccionar</SelectItem>
                    {jobOpenings?.map((jobOpening) => (
                      <SelectItem key={jobOpening.id} value={jobOpening.id}>
                        {jobOpening.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label>Seniority</Label>

            <Controller
              name="seniority"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingSeniority}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingSeniority
                          ? "Cargando seniorities..."
                          : "Seleccionar seniority"
                      }
                    >
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
          </div>

          <div className="space-y-1">
            <Label>Área</Label>

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
                        isLoadingArea ? "Cargando áreas..." : "Seleccionar área"
                      }
                    >
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
          </div>

          {jobOpening && (
            <>
              <div className="space-y-1">
                <Label htmlFor="desiredSalary">Salario deseado</Label>

                <Input
                  id="desiredSalary"
                  placeholder="Ej. USD 3.000 - 3.500"
                  {...register("desiredSalary")}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="availability">Disponibilidad</Label>

                <Input
                  id="availability"
                  placeholder="Ej. Inmediata, 15 días, 1 mes"
                  {...register("availability")}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label>Nivel de inglés</Label>

            <Controller
              name="englishLevel"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar nivel" />
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
