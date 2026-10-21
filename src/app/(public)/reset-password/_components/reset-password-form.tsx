"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  TriangleAlert,
} from "lucide-react";

import { authClient } from "~/lib/auth/client";
import { passwordRules } from "~/lib/validations/password";
import { cn } from "~/lib/utils";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";

import { InvalidResetLink } from "./invalid-reset-link";
import { ResetPasswordShell } from "./reset-password-shell";

const formSchema = z
  .object({
    password: z
      .string()
      .max(128, "Usá como máximo 128 caracteres")
      .superRefine((value, ctx) => {
        const failed = passwordRules.find((rule) => !rule.test(value));
        if (failed) {
          ctx.addIssue({ code: "custom", message: failed.message });
        }
      }),
    confirmPassword: z.string().min(1, "Repetí la contraseña"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const passwordValue = useWatch({ control, name: "password" });
  const passwordHasError = !!errors.password;

  async function onSubmit(values: FormValues) {
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      if (error.code === "INVALID_TOKEN") {
        setTokenInvalid(true);
        return;
      }

      setError("root", {
        message: "No fue posible restablecer la contraseña. Probá de nuevo.",
      });
      return;
    }

    setIsDone(true);
  }

  if (tokenInvalid) return <InvalidResetLink />;

  if (isDone) {
    return (
      <ResetPasswordShell>
        <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CircleCheck className="size-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Contraseña restablecida
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión
          con la nueva.
        </p>
        <Link
          href="/login"
          className={cn(
            buttonVariants(),
            "mt-6 h-11 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800",
          )}
        >
          Ir a iniciar sesión
          <ArrowRight className="size-4" />
        </Link>
      </ResetPasswordShell>
    );
  }

  return (
    <ResetPasswordShell>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Restablecé tu contraseña
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Definí una nueva contraseña para acceder a tu cuenta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6" noValidate>
        <FieldGroup>
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    className="h-11 rounded-xl pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
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
                    const ok = rule.test(passwordValue ?? "");
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
              </Field>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">
                  Repetir contraseña
                </FieldLabel>
                <Input
                  {...field}
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  className="h-11 rounded-xl"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {errors.root && (
            <Alert variant="destructive">
              <TriangleAlert className="size-4" />
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Restablecer contraseña"
            )}
          </Button>
        </FieldGroup>
      </form>
    </ResetPasswordShell>
  );
}
