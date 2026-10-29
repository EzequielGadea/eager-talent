"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { api } from "~/lib/trpc/react";
import { toast } from "~/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  role: z.enum(["recruiter", "hiringManager"], { error: "Rol incorrecto" }),
});

type FormData = z.infer<typeof formSchema>;

export function UsersInviteDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isRefreshing, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "hiringManager",
    },
  });

  const inviteMutation = api.user.invite.useMutation({
    onError: (error) => {
      toast.add({
        type: "error",
        title: "No se pudo enviar la invitación",
        description: error.message,
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        handleOpenChange(false);
      });
    },
  });

  const isLoading = inviteMutation.isPending || isRefreshing;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  }

  function onSubmit(values: FormData) {
    inviteMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            className={cn(
              buttonVariants({ size: "sm" }),
              "gap-2 rounded-full bg-dashboard-dark text-text-on-dark hover:bg-dashboard-dark-hover cursor-pointer",
            )}
          >
            <Plus size={16} />
            Agregar usuario
          </button>
        }
      />

      <DialogContent className="max-w-110 p-0 overflow-hidden bg-card text-card-foreground border shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-5.5 py-4.5 border-b space-y-0">
            <DialogTitle className="text-base font-bold tracking-tight m-0">
              Agregar usuario
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="p-5.5 flex flex-col gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Email
              </Label>
              <Input
                placeholder="camila.torres@eagerworks.com"
                className="h-10 px-3.25 text-sm bg-card border-input rounded-md focus-visible:border-border-focus! focus-visible:ring-1! focus-visible:ring-accent-green/30!"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Rol */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Rol
              </Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-col gap-2"
                  >
                    {/* Opción 1: Recruiter */}
                    <Label
                      htmlFor="role-recruiter"
                      className={`flex items-start gap-2.5 p-[11px_13px] border rounded-lg cursor-pointer transition-colors ${
                        field.value === "recruiter"
                          ? "border-accent-green bg-success-bg"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem
                        value="recruiter"
                        id="role-recruiter"
                        className="mt-0.5 data-checked:border-2 data-checked:border-accent-green data-checked:bg-accent-green"
                      />
                      <div className="grid gap-0.5">
                        <span className="text-[13px] font-semibold">
                          Recruiter
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Acceso total: candidatos, vacantes, métricas y
                          configuración de la empresa.
                        </span>
                      </div>
                    </Label>

                    {/* Opción 2: Hiring Manager */}
                    <Label
                      htmlFor="role-hiring-manager"
                      className={`flex items-start gap-2.5 p-[11px_13px] border rounded-lg cursor-pointer transition-colors ${
                        field.value === "hiringManager"
                          ? "border-accent-green bg-success-bg"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem
                        value="hiringManager"
                        id="role-hiring-manager"
                        className="mt-0.5 data-checked:border-2 data-checked:border-accent-green data-checked:bg-accent-green"
                      />
                      <div className="grid gap-0.5">
                        <span className="text-[13px] font-semibold">
                          Hiring Manager
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Solo las vacantes que le asignes, en modo lectura.
                          Puede comentar las entrevistas que le asignen.
                        </span>
                      </div>
                    </Label>
                  </RadioGroup>
                )}
              />
              {errors.role && (
                <p className="text-xs text-danger">{errors.role.message}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5.5 py-3.5 border-t bg-muted/30">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full font-semibold text-[13px] h-auto px-3.75 py-2"
                >
                  Cancelar
                </Button>
              }
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full font-semibold text-[13px] h-auto px-4.25 py-2 bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar invitación
                  <ArrowRight className="w-3.75 h-3.75" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
