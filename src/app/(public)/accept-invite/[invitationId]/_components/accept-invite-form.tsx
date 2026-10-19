"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  TriangleAlert,
} from "lucide-react";

import { authClient } from "~/lib/auth/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { InvitationInfo } from "../../_types/invitation-info";
import { InvalidToken } from "./invalid-token";
import { passwordRules } from "~/lib/validations/password";
import { InviteShell } from "./invite-shell";

const formSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresá tu nombre"),
    lastName: z.string().trim().min(1, "Ingresá tu apellido"),
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

export function AcceptInviteForm({
  token,
  invitation,
}: {
  token: string;
  invitation: InvitationInfo;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const isSubmitting = form.formState.isSubmitting;
  const passwordValue = useWatch({
    control: form.control,
    name: "password",
  });
  const passwordHasError = !!form.formState.errors.password;

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      if (error.code === "INVALID_TOKEN") {
        setTokenInvalid(true);
        return;
      }
      setServerError(
        error.message ?? "No pudimos activar tu cuenta. Probá de nuevo.",
      );
      return;
    }

    const signIn = await authClient.signIn.email({
      email: invitation.email,
      password: values.password,
    });

    if (signIn.error) {
      setServerError(
        "Hubo un problema al iniciar tu sesión. Intenta iniciar sesión otra vez.",
      );
      router.push("/login");
      return;
    }

    const { error: updateError } = await authClient.updateUser({
      name: values.name,
      lastName: values.lastName,
    });

    if (updateError) {
      setServerError("Hubo un error al actualizar tu nombre.");
    }

    const { data: accepted, error: inviteError } =
      await authClient.organization.acceptInvitation({
        invitationId: invitation.invitationId,
      });

    if (inviteError) {
      setServerError(
        "Hubo un error al aceptar la invitación a la organización.",
      );
      return;
    }

    const organizationId = accepted?.invitation?.organizationId;

    if (organizationId) {
      const { error: setActiveError } = await authClient.organization.setActive(
        {
          organizationId,
        },
      );

      if (setActiveError) {
        setServerError("Hubo un error al activar la organización.");
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  if (tokenInvalid) return <InvalidToken />;

  return (
    <InviteShell>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Creá tu contraseña
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-900">
          {invitation.inviterName}
        </span>{" "}
        te invitó a EagerTalent como{" "}
        <span className="font-semibold text-slate-900">{invitation.role}</span>.
        Definí una contraseña para activar tu cuenta.
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-xl border bg-slate-50 px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Mail className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400">Cuenta invitada</p>
          <p className="truncate text-sm text-slate-900">{invitation.email}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6" noValidate>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nombre</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Tu nombre"
                    aria-invalid={fieldState.invalid}
                    className="h-11 rounded-xl"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="lastName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                  <Input
                    {...field}
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Tu apellido"
                    aria-invalid={fieldState.invalid}
                    className="h-11 rounded-xl"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
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
            control={form.control}
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

          {serverError && (
            <Alert variant="destructive">
              <TriangleAlert className="size-4" />
              <AlertDescription>{serverError}</AlertDescription>
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
              <>
                Activar cuenta e ingresar
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400">
            La invitación vence el {invitation.expiresAt}.
          </p>
        </FieldGroup>
      </form>
    </InviteShell>
  );
}

export default function AcceptInvitePage({
  token,
  invitation,
}: {
  token: string;
  invitation: InvitationInfo;
}) {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm token={token} invitation={invitation} />
    </Suspense>
  );
}
