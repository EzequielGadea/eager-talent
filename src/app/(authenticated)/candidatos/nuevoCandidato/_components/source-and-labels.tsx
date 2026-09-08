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

export default function SourceAndLabels() {
  const { register, control } =
    useFormContext<CandidateFormValues>();

  const sources = [
    { label: "LinkedIn", value: "linkedin" },
    { label: "Referido", value: "referral" },
    { label: "Sitio web", value: "website" },
    { label: "Otro", value: "other" },
  ];

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Origen y etiquetas
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Source</Label>

            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar origen" />
                  </SelectTrigger>

                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem
                        key={source.value}
                        value={source.value}
                      >
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="howDidYouHear">
              ¿Cómo escuchó de nosotros?
            </Label>

            <Input
              id="howDidYouHear"
              placeholder="Ej. A través de LinkedIn"
              {...register("howDidYouHear")}
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="tags">
              Etiquetas
            </Label>

            <Input
              id="tags"
              placeholder="Ej. Node, Postgres"
              {...register("tags")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}