"use client";

import { Plus, Upload } from "lucide-react";
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

import { paises as countries } from "~/lib/countries";

import type { CandidateFormValues } from "./new-candidate-form";

export default function PersonalData() {
  const { register, control, formState: { errors } } =
    useFormContext<CandidateFormValues>();

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Datos personales
        </CardTitle>
      </CardHeader>

      <CardContent>


        <div className="flex flex-col gap-4 md:flex-row">
          {/* Photo */}
          <div className="flex shrink-0 flex-col items-center">
            <input
                id="photo"
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                {...register("photo")}
              />
            <label 
              htmlFor="photo" className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed text-muted-foreground hover:bg-muted">
            <Upload
              className="h-6 w-6"
            />
            </label>

            <span className="mt-1 text-xs text-muted-foreground">
              Foto
            </span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name">
                Nombre {" "}
                <span className="text-red-500">*</span>
              </Label>

              <Input
                id="name"
                placeholder="Ej. Santiago"
                {...register("name")}
              />
              {errors.name && (
                <p>{errors.name.message}</p>  
              )}
            </div>


            <div className="space-y-1">
              <Label htmlFor="lastname">
                Apellido{" "}
                <span className="text-red-500">*</span>
              </Label>

              <Input
                id="lastname"
                placeholder="Ej. González"
                {...register("lastname")}
              />
              {errors.lastname && (
                <p>{errors.lastname.message}</p>  
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">
                Correo electrónico{" "}
                <span className="text-red-500">*</span>
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="nombre@mail.com"
                {...register("email")}
              />
              {errors.email && (
                <p>{errors.email.message}</p>  
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">
                Teléfono
              </Label>

              <Input
                id="phone"
                placeholder="+598 99 000 000"
                {...register("phone")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="country">
                País
              </Label>

              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="country"
                      className="w-full"
                    >
                      <SelectValue placeholder="Seleccionar país" />
                    </SelectTrigger>

                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem
                          key={country.codigo}
                          value={country.codigo}
                        >
                          {country.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="linkedin">
                LinkedIn
              </Label>

              <Input
                id="linkedin"
                placeholder="linkedin.com/in/..."
                {...register("linkedin")}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}