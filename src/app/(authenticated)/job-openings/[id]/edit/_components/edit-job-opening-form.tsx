"use client";

import { useTransition, type ReactNode } from "react";
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
        router.push(`/job-openings/${jobOpening.id}/pipeline`);
        router.refresh();
      });
    },

    onError: (error) => {
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
    await updateJobOpening.mutateAsync(values);
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
                className="w-full rounded-full px-6 text-text-secondary sm:w-auto"
                render={
                  <Link
                    href={`/job-openings/${defaultValues.id}/pipeline`}
                    onClick={handleCancel}
                  />
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                size="lg"
                disabled={isSaving}
                className="w-full rounded-full px-6 sm:w-auto"
              >
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
    </FormProvider>
  );
}
