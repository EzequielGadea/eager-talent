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

const passwordRules = [
  {
    id: "length",
    label: "Mínimo 8 caracteres",
    message: "Usá al menos 8 caracteres",
    test: (v: string) => v.length >= 8,
  },
  {
    id: "upper",
    label: "Una mayúscula",
    message: "Incluí al menos una mayúscula",
    test: (v: string) => /\p{Lu}/u.test(v),
  },
  {
    id: "lower",
    label: "Una minúscula",
    message: "Incluí al menos una minúscula",
    test: (v: string) => /\p{Ll}/u.test(v),
  },
  {
    id: "number",
    label: "Un número",
    message: "Incluí al menos un número",
    test: (v: string) => /\p{N}/u.test(v),
  },
  {
    id: "symbol",
    label: "Un símbolo (ej: ! @ # $ %)",
    message: "Incluí al menos un símbolo",
    test: (v: string) => /[^\p{L}\p{N}\s]/u.test(v),
  },
];

const formSchema = z
  .object({
    name: z.string().min(2, "Ingresá tu nombre y apellido"),
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      {/* círculos decorativos del fondo */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-88 rounded-full bg-emerald-100/70" />
      <div className="pointer-events-none absolute right-[18%] top-[16%] size-52 rounded-full bg-blue-100/50" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-104 rounded-full bg-violet-100/60" />

      <div className="relative w-full max-w-105 rounded-3xl border bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 text-white">
            <ArrowRight className="size-4 -rotate-90" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            EagerTalent
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}

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
    defaultValues: { password: "", confirmPassword: "" },
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
      console.log(signIn.error);
      router.push("/login");
      return;
    }

    const { error: updateError } = await authClient.updateUser({
      name: values.name,
    });

    if (updateError) {
      console.error(
        "Error al actualizar el nombre del usuario:",
        updateError.message,
      );
    }

    const { error: inviteError } =
      await authClient.organization.acceptInvitation({
        invitationId: invitation.invitationId,
      });

    if (inviteError) {
      console.error(
        "Error al aceptar la invitación a la organización:",
        inviteError.message,
      );
    }

    router.push("/");
    router.refresh();
  }

  if (tokenInvalid) return <InvalidToken />;

  return (
    <Shell>
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
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Nombre y apellido</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
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
    </Shell>
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
