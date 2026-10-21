"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";

import {
  getUpdateJobOpeningFormSchema,
  type UpdateJobOpeningInput,
} from "~/lib/validations/job-opening";
import { api } from "~/lib/trpc/react";
import { toast } from "~/components/ui/toast";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type EditJobOpeningFormProps = {
  defaultValues: UpdateJobOpeningInput;
  children: ReactNode;
};

export function EditJobOpeningForm({
  defaultValues,
  children,
}: EditJobOpeningFormProps) {
  const router = useRouter();
  const [isNavigationPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] =
    useState<UpdateJobOpeningInput | null>(null);

  const form = useForm<UpdateJobOpeningInput>({
    resolver: zodResolver(getUpdateJobOpeningFormSchema(defaultValues.stages)),
    defaultValues,
  });

  const updateJobOpening = api.jobOpening.update.useMutation({
    onSuccess: (jobOpening) => {
      toast.add({
        title: "Vacante actualizada correctamente",
        type: "success",
      });

      startTransition(() => {
        setIsConfirmOpen(false);
        router.push(`/job-openings/${jobOpening.id}/pipeline`);
        router.refresh();
      });
    },

    onError: (error) => {
      setIsConfirmOpen(false);

      if (error.data?.code === "CONFLICT") {
        const currentValues = form.getValues();

        form.reset(
          {
            ...currentValues,
            stages: defaultValues.stages,
          },
          {
            keepDefaultValues: true,
          },
        );
      }

      toast.add({
        title: error.message,
        type: "error",
      });
    },
  });

  const isSaving =
    form.formState.isSubmitting ||
    updateJobOpening.isPending ||
    isNavigationPending;

  async function handleSubmit(values: UpdateJobOpeningInput) {
    if (values.status === "Closed" || values.status === "Cancelled") {
      setPendingSubmitValues(values);
      setIsConfirmOpen(true);
      return;
    }

    await updateJobOpening.mutateAsync(values);
  }

  async function handleConfirmTerminalSubmit() {
    if (!pendingSubmitValues || isSaving) {
      return;
    }

    await updateJobOpening.mutateAsync(pendingSubmitValues);
  }

  function handleInvalidSubmit(errors: FieldErrors<UpdateJobOpeningInput>) {
    const stageErrorMessage =
      typeof errors.stages?.message === "string"
        ? errors.stages.message
        : errors.stages?.root?.message;

    toast.add({
      title:
        typeof stageErrorMessage === "string"
          ? stageErrorMessage
          : "Revisá los campos obligatorios antes de guardar",
      type: "error",
    });
  }

  function handleCancel() {
    form.reset(defaultValues);
  }

  const isClosing = pendingSubmitValues?.status === "Closed";

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)}
        noValidate
      >
        {children}
        <footer className="pb-6">
          <Card className="w-full rounded-xl py-5 shadow-sm">
            <CardContent className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                nativeButton={false}
                variant="outline"
                size="lg"

                render={
                  <Link
                    href={`/job-openings/${defaultValues.id}/pipeline`}
                    onClick={handleCancel}
                  />
                }
              >
                Cancelar
              </Button>

              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoaderCircle
                      data-icon="inline-start"
                      aria-hidden="true"
                      className="animate-spin"
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    Guardar cambios
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </footer>
      </form>

      <Dialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setIsConfirmOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isClosing
                ? "¿Pasar la vacante a Cerrada?"
                : "¿Pasar la vacante a Cancelada?"}
            </DialogTitle>
            <DialogDescription>
              Una vez que confirmes el cambio a{" "}
              <span className="font-semibold text-text-primary">
                {isClosing ? "Cerrada" : "Cancelada"}
              </span>
              , no se podrá volver a modificar el estado ni editar los datos de
              esta vacante.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => setIsConfirmOpen(false)}
            >
              Volver
            </Button>
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => void handleConfirmTerminalSubmit()}
            >
              {isSaving
                ? "Confirmando..."
                : isClosing
                  ? "Cerrar vacante"
                  : "Cancelar vacante"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
