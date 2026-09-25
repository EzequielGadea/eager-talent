"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "~/components/ui/combobox";

import { z } from "zod";

import { api } from "~/lib/trpc/react";
import { SalaryCurrency } from "~/generated/prisma/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "~/components/ui/field";
import { Button } from "~/components/ui/button";

const applicationFormSchema = z.object({
  applicantId: z.string({ error: "Debe indicar a quién postula." }),
  jobOpeningId: z.string({ error: "Debe indicar la vacante." }),
  desiredSalary: z.coerce
    .number({ error: "Debe indicar el salario." })
    .positive({ error: "Salario negativo?" }),
  currency: z.enum(SalaryCurrency, { error: "Debe elegir una moneda" }),
  availability: z
    .string({ error: "Debe indicar la disponibilidad" })
    .min(1, "La disponibilidad es demasiado corta."),
});

export function ApplyToVacantDialog({
  showDialog,
  setShowDialog,
  applicantId,
}: {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  applicantId: string;
}) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<
    z.input<typeof applicationFormSchema>,
    unknown,
    z.output<typeof applicationFormSchema>
  >({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      applicantId: applicantId,
    },
  });

  const createApplicationMutation =
    api.application.createApplication.useMutation({
      onSuccess: () => {
        reset();
        setTimeout(() => {}, 200);
        setShowDialog(false);
      },
      onError: (e) => {
        if (e.data?.code === "CONFLICT") {
          setError("jobOpeningId", {
            message: e.message,
          });
          return;
        }

        setError("root", {
          message: e.message,
        });
        console.log("hubo error...");
      },
    });

  async function createApplication(
    data: z.output<typeof applicationFormSchema>,
  ) {
    await createApplicationMutation.mutateAsync({
      applicantId: data.applicantId,
      jobOpeningId: data.jobOpeningId,
      desiredSalary: data.desiredSalary,
      currency: data.currency,
      availability: data.availability,
    });
  }

  const { data: jobOpenings, isLoading: isLoadingJobOpening } =
    api.jobOpening.getAllJobOpenings.useQuery({});

  const isJobOpeningSelected = useWatch({
    control,
    name: "jobOpeningId",
  });
  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <form onSubmit={handleSubmit(createApplication)}>
            <DialogHeader>
              <DialogTitle>Postular candidato</DialogTitle>
              <DialogDescription>
                Por favor, completá la información para postular al candidato a
                una vacante.
              </DialogDescription>
            </DialogHeader>
            {errors.root && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </div>
            )}
            <FieldGroup>
              <Controller
                control={control}
                name="jobOpeningId"
                render={({ field, fieldState }) => {
                  const selected =
                    jobOpenings?.find((item) => item.id === field.value) ??
                    null;

                  return (
                    <Field>
                      <FieldLabel>Vacante</FieldLabel>
                      <Combobox
                        items={jobOpenings}
                        name={field.name}
                        value={selected}
                        autoHighlight
                        onValueChange={(item) => field.onChange(item?.id ?? "")}
                        itemToStringValue={(item) => item.id}
                        itemToStringLabel={(item) => item.name}
                        isItemEqualToValue={(a, b) => a.id === b.id}
                      >
                        <ComboboxInput
                          placeholder="Buscar vacante..."
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                          showClear
                          className="flex justify-between *:grow"
                        />
                        <ComboboxContent className="w-full justify-between">
                          <ComboboxEmpty>No hay vacantes.</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item.id} value={item}>
                                {item.name}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  );
                }}
              />
              <Controller
                control={control}
                name="availability"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Disponibilidad</FieldLabel>
                    <Input
                      placeholder="Ej. Inmediata, 15 días, 1 mes"
                      disabled={!isJobOpeningSelected}
                      {...field}
                    />
                    {fieldState.invalid && isJobOpeningSelected && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <div className="flex flex-col gap-4 sm:flex-row mb-5">
                <Controller
                  control={control}
                  name="desiredSalary"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Salario deseado</FieldLabel>
                      <Input
                        type="number"
                        placeholder="Ej. 3.500"
                        disabled={!isJobOpeningSelected}
                        min={0}
                        {...field}
                        value={
                          (field.value as string | number | undefined) ?? ""
                        }
                      />
                      {fieldState.invalid && isJobOpeningSelected && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="currency"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Moneda</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!isJobOpeningSelected}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Moneda" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="UYU">UYU</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && isJobOpeningSelected && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createApplicationMutation.isPending}
              >
                {createApplicationMutation.isPending
                  ? "Enviando..."
                  : "Postular"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
