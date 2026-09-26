"use client";

import { Upload, X } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import type { ApplicantFormValues } from "./edit-applicant-form";

type Props = {
  currentResume?: string | null;
  currentEducation?: string | null;
  removeResume: boolean;
  setRemoveResume: (value: boolean) => void;
  removeEducation: boolean;
  setRemoveEducation: (value: boolean) => void;
};
export default function EducationAndFiles({
  currentResume,
  currentEducation,
  removeResume,
  setRemoveResume,
  removeEducation,
  setRemoveEducation,
}: Props) {
  const {
    control,
    register,
    resetField,
    formState: { errors },
  } = useFormContext<ApplicantFormValues>();

  const educationWatch = useWatch({
    control,
    name: "education",
  });

  const resumeWatch = useWatch({
    control,
    name: "resume",
  });

  const resumeFile = resumeWatch?.[0];
  const educationFile = educationWatch?.[0];

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Formación y archivos
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="academicInstitution">Formación académica</Label>

            <Input
              id="academicInstitution"
              placeholder="Ej. Universidad de Buenos Aires"
              {...register("academicInstitution")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1 md:col-span-1">
              <Label htmlFor="title">Título</Label>

              <Input
                id="title"
                placeholder="Ej. Ingeniería en Sistemas"
                {...register("title")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="careerStartYear">Año de inicio</Label>

              <Input
                id="careerStartYear"
                type="number"
                max="2100"
                min="1900"
                placeholder="Ej. 2020"
                {...register("careerStartYear", {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="careerEndYear">Año de fin</Label>

              <Input
                id="careerEndYear"
                type="number"
                max="2100"
                min="1900"
                placeholder="Ej. 2024"
                {...register("careerEndYear", {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="resume">CV</Label>

              <input
                id="resume"
                type="file"
                accept=".pdf"
                className="hidden"
                {...register("resume")}
              />

              <div className="flex items-center gap-2">
                <label
                  htmlFor="resume"
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-default px-3 py-3 text-sm text-text-secondary hover:bg-surface-hover"
                >
                  <Upload className="h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {resumeFile ? resumeFile.name : "Subir CV (PDF)"}
                  </span>
                </label>

                {resumeFile ? (
                  <button
                    type="button"
                    onClick={() => resetField("resume")}
                    aria-label="Eliminar CV seleccionado"
                    className="shrink-0 rounded-md p-2 text-text-secondary hover:bg-surface-hover hover:text-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  currentResume &&
                  !removeResume && (
                    <>
                      <a
                        href={currentResume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-sm font-medium text-primary hover:underline"
                      >
                        Ver CV
                      </a>

                      <button
                        type="button"
                        onClick={() => setRemoveResume(true)}
                        aria-label="Eliminar CV actual"
                        className="shrink-0 rounded-md p-2 text-text-secondary hover:bg-surface-hover hover:text-danger"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )
                )}
              </div>

              {removeResume && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>El CV será eliminado al guardar.</span>

                  <button
                    type="button"
                    onClick={() => setRemoveResume(false)}
                    className="font-medium text-primary hover:underline"
                  >
                    Deshacer
                  </button>
                </div>
              )}

              {errors.resume && (
                <p className="text-danger">{errors.resume.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="education">Escolaridad</Label>

              <input
                id="education"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                {...register("education")}
              />

              <div className="flex items-center gap-2">
                <label
                  htmlFor="education"
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-default px-3 py-3 text-sm text-text-secondary hover:bg-surface-hover"
                >
                  <Upload className="h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {educationFile ? educationFile.name : "Subir escolaridad"}
                  </span>
                </label>

                {educationFile ? (
                  <button
                    type="button"
                    onClick={() => resetField("education")}
                    aria-label="Eliminar escolaridad seleccionada"
                    className="shrink-0 rounded-md p-2 text-text-secondary hover:bg-surface-hover hover:text-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  currentEducation &&
                  !removeEducation && (
                    <>
                      <a
                        href={currentEducation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-sm font-medium text-primary hover:underline"
                      >
                        Ver escolaridad
                      </a>

                      <button
                        type="button"
                        onClick={() => setRemoveEducation(true)}
                        aria-label="Eliminar escolaridad actual"
                        className="shrink-0 rounded-md p-2 text-text-secondary hover:bg-surface-hover hover:text-danger"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )
                )}
              </div>

              {removeEducation && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>La escolaridad será eliminada al guardar.</span>

                  <button
                    type="button"
                    onClick={() => setRemoveEducation(false)}
                    className="font-medium text-primary hover:underline"
                  >
                    Deshacer
                  </button>
                </div>
              )}

              {errors.education && (
                <p className="text-danger">{errors.education.message}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
