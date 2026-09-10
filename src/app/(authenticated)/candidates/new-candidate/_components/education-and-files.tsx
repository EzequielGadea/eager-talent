"use client";

import { Upload } from "lucide-react";
import { useFormContext } from "react-hook-form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import type { CandidateFormValues } from "./new-candidate-form";

export default function EducationAndFiles() {
  const { register } =
    useFormContext<CandidateFormValues>();

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
            <Label htmlFor="academicInstitution">
              Formación académica
            </Label>

            <Input
              id="academicInstitution"
              placeholder="Ej. Ing. en Sistemas — Universidad de Buenos Aires"
              {...register("academicInstitution")}
            />
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

              <label
                htmlFor="resume"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground hover:bg-muted"
              >
                <Upload className="h-4 w-4" />
                Subir CV (PDF)
              </label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="education">
                Escolaridad
              </Label>

              <input
                id="education"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                {...register("education")}
              />

              <label
                htmlFor="education"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground hover:bg-muted"
              >
                <Upload className="h-4 w-4" />
                Subir certificado
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}