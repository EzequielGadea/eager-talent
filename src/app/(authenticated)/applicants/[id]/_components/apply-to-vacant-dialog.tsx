"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
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
} from "~/components/ui/combobox2";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";

import { z } from "zod";

import { api } from "~/lib/trpc/react";
import { SalaryCurrency } from "~/generated/prisma/enums";
import { salaryCurrencyTranslations } from "~/lib/enum-translations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";
import { Loader2, X } from "lucide-react";

const applicationFormSchema = z
  .object({
    applicantId: z.string({ error: "Debe indicar a quién postula" }),
    jobOpeningId: z.string({ error: "Debe indicar la vacante" }),
    desiredSalary: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce
        .number()
        .positive({
          error: "El salario debe ser mayor a 0",
        })
        .optional(),
    ),
    currency: z.enum(SalaryCurrency).optional(),
    availability: z
      .string(
        /* Este campo es opcional
        { error: "Debe indicar la disponibilidad" }*/
      )
      .trim()
      //.min(1, "La disponibilidad es demasiado corta.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.desiredSalary !== undefined && data.currency === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["currency"],
        message: "Debe elegir una moneda si ingresa salario.",
      });
    }

    if (data.currency !== undefined && data.desiredSalary === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["desiredSalary"],
        message: "Debe indicar el salario deseado si ingresa moneda.",
      });
    }
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
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();
  const utils = api.useUtils();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    trigger,
    formState: { errors, isValid },
  } = useForm<
    z.input<typeof applicationFormSchema>,
    unknown,
    z.output<typeof applicationFormSchema>
  >({
    resolver: zodResolver(applicationFormSchema),
    mode: "onChange",
    defaultValues: {
      applicantId,
      jobOpeningId: "",
      desiredSalary: "",
      availability: "",
    },
  });

  const createApplicationMutation =
    api.application.createApplicationFromApplicant.useMutation({
      onSuccess: async () => {
        await utils.jobOpening.getAllOpenJobOpenings.invalidate({
          applicantId,
        });
        startTransition(() => {
          reset();
          setShowDialog(false);
          router.refresh();
        });
        toast.add({
          title: "Candidato postulado correctamente",
          type: "success",
        });
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
      availability: data.availability ?? "",
    });
  }

  const {
    data: jobOpenings,
    isLoading: isLoadingJobOpening,
    error: jobOpeningsError,
  } = api.jobOpening.getAllOpenJobOpenings.useQuery(
    { applicantId },
    { enabled: showDialog },
  );

  const isJobOpeningSelected = useWatch({
    control,
    name: "jobOpeningId",
  });

  /*
   * con los siguientes watch y effect puedo hacer que el error de
   * monedas/salario se muestre al ingresar datos a los campos, comentarlos
   * junto con los disabled del boton de subida:
   * jobOpeningsError != null e isValid (lineas 392 y 393 al escribir esto)
   * si se prefiere que se bloquee el intento de submit si hay errores,
   * esas condiciones impiden se suba el form cuando zod encuentra algun error
   */

  const desiredSalary = useWatch({
    control,
    name: "desiredSalary",
  });
  const currency = useWatch({
    control,
    name: "currency",
  });

  useEffect(() => {
    void trigger(["desiredSalary", "currency"]);
  }, [desiredSalary, currency, trigger]);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="w-full max-w-lg gap-0 overflow-hidden p-0">
        <form
          onSubmit={handleSubmit(createApplication)}
          className="flex flex-col"
        >
          <div className="border-b border-border-default px-6 py-5">
            <DialogTitle className="text-text-primary">
              Postular candidato
            </DialogTitle>

            <DialogDescription className="mt-1 text-sm text-text-secondary">
              Por favor, completá la información para postular al candidato a
              una vacante.
            </DialogDescription>
          </div>

          <div className="flex flex-col gap-5 px-6 py-5">
            {errors.root && (
              <p
                role="alert"
                className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger"
              >
                {errors.root.message}
              </p>
            )}

            {jobOpeningsError && (
              <p
                role="alert"
                className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger"
              >
                {jobOpeningsError.message}
              </p>
            )}

            {!isLoadingJobOpening &&
              !jobOpeningsError &&
              jobOpenings?.length === 0 && (
                <p className="rounded-md border border-border-default bg-muted px-3 py-2 text-sm text-text-secondary">
                  No hay vacantes disponibles para postular al candidato.
                </p>
              )}

            <Controller
              control={control}
              name="jobOpeningId"
              render={({ field, fieldState }) => {
                const selected =
                  jobOpenings?.find((item) => item.id === field.value) ?? null;

                return (
                  <div className="grid gap-2">
                    <label
                      htmlFor="apply-job-opening"
                      className="text-sm font-medium text-text-primary"
                    >
                      Vacante
                    </label>

                    <Combobox
                      items={jobOpenings ?? []}
                      name={field.name}
                      value={selected}
                      autoHighlight
                      onValueChange={(item) => field.onChange(item?.id ?? "")}
                      itemToStringValue={(item) => item.id}
                      itemToStringLabel={(item) => item.name}
                      isItemEqualToValue={(a, b) => a.id === b.id}
                    >
                      <ComboboxInput
                        id="apply-job-opening"
                        placeholder="Buscar vacante..."
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        showClear
                      />
                      <ComboboxContent>
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
                      <p className="text-xs text-danger">
                        {fieldState.error?.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />

            <FieldGroup>
              <div className="grid gap-2">
                <label
                  htmlFor="apply-desired-salary"
                  className="text-sm font-medium text-text-primary"
                >
                  Salario deseado
                </label>

                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <Controller
                    control={control}
                    name="desiredSalary"
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1">
                        <Input
                          id="apply-desired-salary"
                          type="number"
                          step="0.01"
                          placeholder="Ej. 3500"
                          disabled={!isJobOpeningSelected}
                          min={0}
                          aria-invalid={
                            fieldState.invalid && !!isJobOpeningSelected
                          }
                          {...field}
                          value={
                            (field.value as string | number | undefined) ?? ""
                          }
                        />

                        {fieldState.invalid && isJobOpeningSelected && (
                          <p className="text-xs text-danger">
                            {fieldState.error?.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name="currency"
                    render={({ field, fieldState }) => (
                      <div className="grid gap-1">
                        <Select
                          value={field.value ?? null}
                          onValueChange={field.onChange}
                          disabled={!isJobOpeningSelected}
                        >
                          <SelectTrigger
                            aria-label="Moneda"
                            aria-invalid={
                              fieldState.invalid && !!isJobOpeningSelected
                            }
                            className="w-full disabled:bg-input/50 dark:disabled:bg-input/80"
                          >
                            <SelectValue placeholder="Moneda">
                              {field.value
                                ? salaryCurrencyTranslations[field.value]
                                : undefined}
                            </SelectValue>
                            {field.value && (
                              <span
                                role="button"
                                tabIndex={isJobOpeningSelected ? 0 : -1}
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  field.onChange(undefined);
                                }}
                                aria-label="Quitar moneda"
                                className="ml-auto rounded-sm p-1 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-4 w-4" />
                              </span>
                            )}
                          </SelectTrigger>

                          <SelectContent>
                            {Object.values(SalaryCurrency).map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {salaryCurrencyTranslations[currency]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {fieldState.invalid && isJobOpeningSelected && (
                          <p className="text-xs text-danger">
                            {fieldState.error?.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <Controller
                control={control}
                name="availability"
                render={({ field, fieldState }) => (
                  <Field className="mb-5">
                    <FieldLabel>Disponibilidad</FieldLabel>
                    <Input
                      placeholder="Ej. Inmediata, 15 días, 1 mes"
                      disabled={!isJobOpeningSelected}
                      {...field}
                    />
                    {fieldState.invalid && isJobOpeningSelected && (
                      <p className="text-xs text-danger">
                        {fieldState.error?.message}
                      </p>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setShowDialog(false);
                }}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  !isJobOpeningSelected ||
                  createApplicationMutation.isPending ||
                  isTransitionPending ||
                  isLoadingJobOpening ||
                  jobOpeningsError != null ||
                  !isValid ||
                  !jobOpenings?.length
                }
              >
                {(createApplicationMutation.isPending ||
                  isTransitionPending) && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Postular
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
