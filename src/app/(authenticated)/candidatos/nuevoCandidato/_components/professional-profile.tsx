"use client";

import {
  Controller,
  useFormContext,
} from "react-hook-form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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

export default function ProfessionalProfile() {
  const { register, control } =
    useFormContext<CandidateFormValues>();

  const roles = [
    { label: "Backend Developer", value: "backend-developer" },
    { label: "Frontend Developer", value: "frontend-developer" },
    { label: "Fullstack Developer", value: "fullstack-developer" },
    { label: "QA Engineer", value: "qa-engineer" },
  ];

  const jobOpenings = [
    { label: "Sin vacante — base de talentos", value: "no-opening" },
    { label: "Backend Developer", value: "backend-developer" },
    { label: "Frontend Developer", value: "frontend-developer" },
  ];

  const seniorityLevels = [
    { label: "Junior", value: "junior" },
    { label: "Semi Senior", value: "semi-senior" },
    { label: "Senior", value: "senior" },
  ];

  const areas = [
    { label: "Tecnología", value: "technology" },
    { label: "Diseño", value: "design" },
    { label: "Producto", value: "product" },
  ];

  const englishLevels = [
    { label: "Básico (A1-A2)", value: "A1-A2" },
    { label: "Intermedio (B1-B2)", value: "B1-B2" },
    { label: "Avanzado (C1-C2)", value: "C1-C2" },
  ];

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="gap-1 pb-3">
        <CardTitle className="text-sm font-semibold">
          Perfil profesional
        </CardTitle>

        <p className="text-xs text-muted-foreground">
          El Rol es el perfil del candidato. La Vacante es opcional.
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>
              Rol <span className="text-red-500">*</span>
            </Label>

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>

                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar vacante" />
                  </SelectTrigger>

                  <SelectContent>
                    {jobOpenings.map((jobOpening) => (
                      <SelectItem
                        key={jobOpening.value}
                        value={jobOpening.value}
                      >
                        {jobOpening.label}
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
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar seniority" />
                  </SelectTrigger>

                  <SelectContent>
                    {seniorityLevels.map((level) => (
                      <SelectItem
                        key={level.value}
                        value={level.value}
                      >
                        {level.label}
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
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>

                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem
                        key={area.value}
                        value={area.value}
                      >
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="desiredSalary">
              Salario deseado
            </Label>

            <Input
              id="desiredSalary"
              placeholder="Ej. USD 3.000 - 3.500"
              {...register("desiredSalary")}
            />
          </div>

          <div className="space-y-1">
            <Label>Nivel de inglés</Label>

            <Controller
              name="englishLevel"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>

                  <SelectContent>
                    {englishLevels.map((level) => (
                      <SelectItem
                        key={level.value}
                        value={level.value}
                      >
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