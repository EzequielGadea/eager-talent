"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import {
  ArrowRight,
  Check,
  Circle,
  CircleCheck,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth/client";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordSchema,
} from "~/lib/auth/password";
import { passwordRules } from "~/lib/validations/password";
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
  const [isDone, setIsDone] = React.useState(false);
  const [hasSignedOut, setHasSignedOut] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [signOutError, setSignOutError] = React.useState<string | null>(null);
  const processingRef = React.useRef(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] =
    React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    getValues,
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

  const newPassword = useWatch({ control, name: "newPassword" });
  const passwordHasError = !!errors.newPassword;
  const isBusy = isLoading || isRedirecting;

  function closeAndReset() {
    if (processingRef.current || isBusy || isDone) return;

    setOpen(false);
    setShowCancelConfirmation(false);
    reset();
    setSignOutError(null);
    setShowCurrentPassword(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function handleCancel() {
    if (processingRef.current || isBusy || isDone) return;

    const values = getValues();

    const hasChanges =
      values.currentPassword !== "" ||
      values.newPassword !== "" ||
      values.confirmPassword !== "";

    if (hasChanges) {
      setShowCancelConfirmation(true);
      return;
    }

    closeAndReset();
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setOpen(true);
    } else {
      handleCancel();
    }
  }

  async function finishSignOut() {
    setSignOutError(null);
    try {
      const { error } = await authClient.signOut();
      if (error) throw error;

      setHasSignedOut(true);
    } catch {
      setSignOutError(
        "Tu contraseña fue actualizada, pero no se pudo cerrar la sesión. Reintentá el cierre de sesión.",
      );
    }
  }

  function handleGoToLogin() {
    if (processingRef.current || isBusy || !hasSignedOut) return;

    setIsRedirecting(true);
    window.location.replace("/login");
  }

  async function handleRetrySignOut() {
    if (processingRef.current || isBusy) return;

    processingRef.current = true;
    setIsLoading(true);
    try {
      await finishSignOut();
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }

  async function onSubmit(values: FormData) {
    if (processingRef.current || isBusy || isDone) return;

    processingRef.current = true;
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

      setIsDone(true);
      reset();
      setShowCurrentPassword(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      await finishSignOut();
    } catch {
      toast.add({
        type: "error",
        title: "Error inesperado",
        description: "No se pudo cambiar la contraseña. Intentá nuevamente.",
      });
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }

  const inputClassName =
    "h-10 px-3.25 text-sm bg-card border-input rounded-md focus-visible:border-border-focus! focus-visible:ring-1! focus-visible:ring-accent-green/30!";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button type="button" variant="outline" className="w-full">
              <KeyRound size={16} />
              Cambiar contraseña
            </Button>
          }
        />

        <DialogContent
          showCloseButton={!isBusy && !isDone}
          className="max-w-110 p-0 overflow-hidden bg-card text-card-foreground border shadow-2xl sm:max-w-110"
        >
          {isDone ? (
            <div className="p-5.5">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 text-white">
                  <ArrowRight className="size-4 -rotate-90" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  EagerTalent
                </span>
              </div>

              <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CircleCheck className="size-5" />
              </div>

              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                Contraseña restablecida
              </DialogTitle>

              <p
                role={signOutError ? "alert" : undefined}
                className="mt-2 text-sm text-slate-500"
              >
                {signOutError ??
                  (hasSignedOut
                    ? "Tu contraseña fue actualizada y tu sesión se cerró. Iniciá sesión con la nueva contraseña."
                    : "Tu contraseña fue actualizada. Estamos cerrando tu sesión.")}
              </p>

              <Button
                type="button"
                onClick={hasSignedOut ? handleGoToLogin : handleRetrySignOut}
                disabled={isBusy}
                className="mt-6 h-11 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                {isRedirecting
                  ? "Redirigiendo..."
                  : isBusy
                    ? "Cerrando sesión..."
                    : hasSignedOut
                      ? "Ir a iniciar sesión"
                      : "Reintentar cerrar sesión"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                void handleSubmit(onSubmit)(event);
              }}
              noValidate
            >
              {/* Header */}
              <DialogHeader className="flex flex-row items-center justify-between px-5.5 py-4.5 border-b space-y-0">
                <DialogTitle className="text-base font-bold tracking-tight m-0">
                  Cambiar contraseña
                </DialogTitle>
              </DialogHeader>

              {/* Body */}
              <fieldset
                disabled={isBusy}
                className="p-5.5 flex min-w-0 flex-col gap-4"
              >
                {/* Contraseña actual */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="current-password"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Contraseña actual
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`${inputClassName} pr-10`}
                      {...register("currentPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      aria-label={
                        showCurrentPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-danger">
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
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      aria-invalid={passwordHasError}
                      className={`${inputClassName} pr-10`}
                      {...register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {passwordRules.map((rule) => {
                      const ok = rule.test(newPassword ?? "");
                      return (
                        <li
                          key={rule.id}
                          className={`flex items-center gap-1.5 text-xs ${
                            ok
                              ? "text-emerald-600"
                              : passwordHasError
                                ? "text-red-600"
                                : "text-slate-400"
                          }`}
                        >
                          {ok ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Circle className="size-3.5" />
                          )}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                  {errors.newPassword &&
                    passwordRules.every((rule) =>
                      rule.test(newPassword ?? ""),
                    ) && (
                      <p className="text-xs text-danger">
                        {errors.newPassword.message}
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
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`${inputClassName} pr-10`}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-danger">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </fieldset>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5.5 py-3.5 border-t bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isBusy}
                  className="rounded-full font-semibold text-[13px] h-auto px-3.75 py-2"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isBusy}
                  className="rounded-full font-semibold text-[13px] h-auto px-4.25 py-2 bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 cursor-pointer"
                >
                  {isBusy ? (
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
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCancelConfirmation}
        onOpenChange={(next) => {
          if (!processingRef.current && !isBusy)
            setShowCancelConfirmation(next);
        }}
      >
        <DialogContent className="w-full max-w-md gap-0 overflow-hidden p-0">
          <div className="border-b border-border-default px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-text-primary">
              Descartar cambios
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-text-secondary">
              Hay contraseñas ingresadas. ¿Querés descartar los cambios? Se
              perderán las contraseñas que escribiste.
            </DialogDescription>
          </div>

          <div className="flex justify-end gap-2 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              className="rounded-full px-5"
              onClick={() => setShowCancelConfirmation(false)}
            >
              Seguir editando
            </Button>

            <Button
              type="button"
              className="rounded-full px-5"
              disabled={isBusy}
              onClick={closeAndReset}
            >
              Descartar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
