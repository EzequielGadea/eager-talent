"use client";

import { Upload, X } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

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

import { paises as countries } from "~/lib/countries";

import type { ApplicantFormValues } from "./new-applicant-form";

type PersonalDataProps = {
  photoPreview?: string;
  setPhotoPreview: Dispatch<SetStateAction<string | undefined>>;
};

export default function PersonalData({
  photoPreview,
  setPhotoPreview,
}: PersonalDataProps) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ApplicantFormValues>();

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const photoField = register("photo");

  function handleRemovePhoto() {
    setValue("photo", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setPhotoPreview(undefined);
  }

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
          <div className="flex shrink-0 flex-col items-center md:w-32 md:pt-6">
            <input
              id="photo"
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              {...photoField}
              onChange={(event) => {
                photoField.onChange(event);

                const file = event.target.files?.[0];

                if (!file) {
                  setPhotoPreview(undefined);
                  return;
                }

                setPhotoPreview(URL.createObjectURL(file));
              }}
            />

            <Attachment
              orientation="vertical"
              size="sm"
              className="!h-32 !w-32 border-dashed"
            >
              <AttachmentMedia variant="image" className="!h-full !w-full p-0">
                <label
                  htmlFor="photo"
                  className="flex h-full w-full cursor-pointer items-center justify-center"
                >
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Vista previa de la foto"
                      width={128}
                      height={128}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Upload className="h-8 w-8" />
                  )}
                </label>
              </AttachmentMedia>

              {photoPreview && (
                <AttachmentAction
                  type="button"
                  aria-label="Quitar foto"
                  onClick={handleRemovePhoto}
                  className="absolute right-1 top-1 !h-6 !w-6 rounded-full bg-surface-card p-0 text-danger"
                >
                  <X className="!h-3 !w-3" />
                </AttachmentAction>
              )}
            </Attachment>

            <span className="mt-1 text-xs text-text-secondary">Foto</span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name">
                Nombre <span className="text-danger">*</span>
              </Label>

              <Input
                id="name"
                placeholder="Ej. Santiago"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-danger">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="lastname">
                Apellido <span className="text-danger">*</span>
              </Label>

              <Input
                id="lastname"
                placeholder="Ej. González"
                {...register("lastname")}
              />
              {errors.lastname && (
                <p className="text-danger">{errors.lastname.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">
                Correo electrónico <span className="text-danger">*</span>
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="nombre@mail.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono</Label>

              <Input
                id="phone"
                placeholder="+598 99 000 000"
                {...register("phone")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="country">País</Label>

              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="country" className="w-full">
                      <SelectValue placeholder="Seleccionar país" />
                    </SelectTrigger>

                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.codigo} value={country.codigo}>
                          {country.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="linkedin">LinkedIn</Label>

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
