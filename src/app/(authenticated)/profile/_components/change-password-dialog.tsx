"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth/client";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordSchema,
} from "~/lib/auth/password";
import { toast } from "~/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "La nueva contraseña debe ser distinta a la actual",
  });

type FormData = z.infer<typeof formSchema>;

type AuthError = {
  code?: string;
  message?: string;
  status?: number;
};

const NEW_PASSWORD_ERROR_CODES = new Set([
  "PASSWORD_REQUIRED",
  "PASSWORD_POLICY_VIOLATION",
  "PASSWORD_TOO_SHORT",
  "PASSWORD_TOO_LONG",
]);

function getChangePasswordErrorMessage(error: AuthError) {
  switch (error.code) {
    case "INVALID_PASSWORD":
      return "La contraseña actual es incorrecta.";
    case "PASSWORD_REQUIRED":
      return "La nueva contraseña es obligatoria.";
    case "PASSWORD_POLICY_VIOLATION":
      // El servidor ya devuelve el detalle de los requisitos en español
      return error.message ?? "La nueva contraseña no cumple los requisitos.";
    case "PASSWORD_TOO_SHORT":
      return `La nueva contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    case "PASSWORD_TOO_LONG":
      return `La nueva contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`;
    case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      return "Tu cuenta no usa contraseña para iniciar sesión.";
    default:
      if (error.status === 401) {
        return "Tu sesión expiró. Volvé a iniciar sesión.";
      }
      return "No se pudo cambiar la contraseña. Intentá nuevamente.";
  }
}

export function ChangePasswordDialog() {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Todos los requisitos que todavía no cumple la contraseña (no solo el primero)
  const newPassword = watch("newPassword");
  const policyIssues = React.useMemo(() => {
    const result = passwordSchema.safeParse(newPassword);
    return result.success ? [] : result.error.issues.map((i) => i.message);
  }, [newPassword]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  async function onSubmit(values: FormData) {
    try {
      setIsLoading(true);

      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        const message = getChangePasswordErrorMessage(error);

        if (error.code === "INVALID_PASSWORD") {
          setError("currentPassword", { message });
          return;
        }

        if (error.code && NEW_PASSWORD_ERROR_CODES.has(error.code)) {
          setError("newPassword", { message });
          return;
        }

        toast.add({
          type: "error",
          title: "No se pudo cambiar la contraseña",
          description: message,
        });
        return;
      }

      toast.add({
        type: "success",
        title: "Contraseña actualizada",
        description: "Tu contraseña se cambió correctamente.",
      });
      handleOpenChange(false);
    } catch {
      toast.add({
        type: "error",
        title: "Error inesperado",
        description: "No se pudo cambiar la contraseña. Intentá nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const inputClassName =
    "h-10 px-3.25 text-sm bg-card border-input rounded-md focus-visible:border-border-focus! focus-visible:ring-1! focus-visible:ring-accent-green/30!";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" className="w-full">
            <KeyRound size={16} />
            Cambiar contraseña
          </Button>
        }
      />

      <DialogContent className="max-w-110 p-0 overflow-hidden bg-card text-card-foreground border shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-5.5 py-4.5 border-b space-y-0">
            <DialogTitle className="text-base font-bold tracking-tight m-0">
              Cambiar contraseña
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="p-5.5 flex flex-col gap-4">
            {/* Contraseña actual */}
            <div className="space-y-1.5">
              <Label
                htmlFor="current-password"
                className="text-xs font-semibold text-muted-foreground"
              >
                Contraseña actual
              </Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                className={inputClassName}
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* Nueva contraseña */}
            <div className="space-y-1.5">
              <Label
                htmlFor="new-password"
                className="text-xs font-semibold text-muted-foreground"
              >
                Nueva contraseña
              </Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                className={inputClassName}
                {...register("newPassword")}
              />
              {errors.newPassword ? (
                policyIssues.length > 0 ? (
                  <ul className="space-y-0.5 text-xs text-destructive">
                    {policyIssues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-destructive">
                    {errors.newPassword.message}
                  </p>
                )
              ) : (
                <p className="text-xs text-muted-foreground">
                  Entre {PASSWORD_MIN_LENGTH} y {PASSWORD_MAX_LENGTH}{" "}
                  caracteres, con mayúscula, minúscula, número y símbolo.
                </p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirm-password"
                className="text-xs font-semibold text-muted-foreground"
              >
                Confirmar nueva contraseña
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                className={inputClassName}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
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
                  Guardando...
                </>
              ) : (
                <>
                  Cambiar contraseña
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
