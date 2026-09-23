"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { SalaryCurrency } from "~/generated/prisma/enums";
import { api } from "~/lib/trpc/react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import type { AvailableApplicant } from "./add-applicant-types";

const addApplicantApplicationSchema = z.object({
  desiredSalary: z
    .number()
    .positive("El salario debe ser mayor a 0.")
    .optional()
    .or(z.literal("")),

  currency: z.union([
    z.enum(SalaryCurrency),
    z.literal(""),
  ]),

  availability: z.string(),
});

type AddApplicantApplicationFormValues = z.infer<
  typeof addApplicantApplicationSchema
>;

type AddApplicantApplicationFormProps = {
  jobOpeningId: string;
  applicant: AvailableApplicant;
  onBack: () => void;
  onSuccess: () => void;
};

function getInitials(applicant: AvailableApplicant) {
  return `${applicant.name.charAt(0)}${applicant.lastName.charAt(0)}`.toUpperCase();
}

export function AddApplicantApplicationForm({
  jobOpeningId,
  applicant,
  onBack,
  onSuccess,
}: AddApplicantApplicationFormProps) {
  const router = useRouter();

  const methods = useForm<AddApplicantApplicationFormValues>({
    resolver: zodResolver(addApplicantApplicationSchema),
    defaultValues: {
      desiredSalary: "",
      currency: "",
      availability: "",
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const createApplicationMutation =
    api.application.createApplication.useMutation({
      onSuccess: () => {
        router.refresh();
        onSuccess();
      },
      onError: (error) => {
        if (error.data?.code === "CONFLICT") {
          methods.setError("root", {
            type: "server",
            message:
              "Este candidato ya está aplicado a esta vacante.",
          });

          return;
        }

        methods.setError("root", {
          type: "server",
          message: "No se pudo crear la postulación.",
        });
      },
    });

  async function onSubmit(
    data: AddApplicantApplicationFormValues,
  ) {
    await createApplicationMutation.mutateAsync({
      applicantId: applicant.id,
      jobOpeningId,
      desiredSalaryAmount:
        data.desiredSalary === ""
          ? undefined
          : data.desiredSalary,
      desiredSalaryCurrency:
        data.currency === ""
          ? undefined
          : data.currency,
      availability:
        data.availability.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col"
    >
      <div className="border-b border-border-default px-6 py-5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onBack}
            disabled={isSubmitting}
            aria-label="Volver"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div>
            <p className="text-lg font-semibold text-text-primary">
              Datos de postulación
            </p>

            <p className="text-sm text-text-secondary">
              Completá los datos de la postulación.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="flex items-center gap-3 rounded-xl border border-border-default p-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage
              src={applicant.photo ?? undefined}
              alt={`${applicant.name} ${applicant.lastName}`}
            />

            <AvatarFallback className="bg-muted text-muted-foreground">
              {getInitials(applicant)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {applicant.name} {applicant.lastName}
            </p>

            <p className="truncate text-xs text-text-secondary">
              {applicant.email ?? "Sin email"}
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="desired-salary"
            className="text-sm font-medium text-text-primary"
          >
            Salario deseado
          </label>

          <div className="grid grid-cols-[1fr_120px] gap-2">
            <div className="grid gap-1">
              <Input
                id="desired-salary"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej. 85000"
                {...register("desiredSalary", {
                  setValueAs: (value) =>
                    value === "" ? "" : Number(value),
                })}
              />

              {errors.desiredSalary && (
                <p className="text-xs text-danger">
                  {errors.desiredSalary.message}
                </p>
              )}
            </div>

            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value ?? "")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="UYU">UYU</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="availability"
            className="text-sm font-medium text-text-primary"
          >
            Disponibilidad
          </label>

          <Input
            id="availability"
            placeholder="Ej. Inmediata, 15 días, 1 mes"
            {...register("availability")}
          />
        </div>

        {errors.root?.message && (
          <p className="text-sm text-danger">
            {errors.root.message}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border-default pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Volver
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="size-4 animate-spin" />
            )}

            Postular
          </Button>
        </div>
      </div>
    </form>
  );
}