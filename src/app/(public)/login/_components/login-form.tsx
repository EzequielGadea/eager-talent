"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap } from "lucide-react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth/client";

const loginSchema = z.object({
  email: z.string().email("Ingresá un correo electrónico válido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function EagerTalentLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="login-logo-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>
        </defs>

        <path
          d="M20 2C31 2 38 9 38 20C38 31 31 38 20 38C9 38 2 31 2 20C2 9 9 2 20 2Z"
          fill="url(#login-logo-gradient)"
        />

        <g stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 22L20 15L27 22" strokeWidth="4" />
          <path d="M13 29.5L20 22.5L27 29.5" strokeWidth="4" opacity="0.5" />
        </g>
      </svg>

      <h1 className="font-(family-name:--font-login-heading) text-[26px] font-bold tracking-[-0.03em]">
        EagerTalent
      </h1>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError("root", {
          message: "El correo o la contraseña son incorrectos.",
        });
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("root", {
        message: "No pudimos iniciar sesión. Intentá nuevamente.",
      });
    }
  });

  return (
    <section className="relative z-10 mx-4 w-full max-w-100 rounded-xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:p-9">
      <EagerTalentLogo />

      <p className="mt-2 mb-7 text-sm text-slate-500">
        Ingresá para gestionar tus candidatos y vacantes.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-4 [&_label]:text-[13px] [&_label]:font-medium"
        noValidate
      >
        <Input
          id="email"
          type="email"
          label="Correo electrónico"
          autoComplete="email"
          errorMessage={errors.email?.message}
          className="h-9.5 rounded-md border-slate-200 px-3 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
          {...register("email")}
        />

        <Input
          id="password"
          type="password"
          label="Contraseña"
          autoComplete="current-password"
          errorMessage={errors.password?.message}
          className="h-9.5 rounded-md border-slate-200 px-3 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
          {...register("password")}
        />

        {errors.root && (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-10 w-full rounded-full border-slate-900 bg-slate-900 px-4.5 text-sm text-white hover:bg-slate-800"
        >
          {isSubmitting ? (
            "Ingresando…"
          ) : (
            <>
              Ingresar
              <Zap aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-5.5 text-center text-xs leading-5 text-slate-400">
        ¿No podés ingresar? Contactá a tu recruiter para restablecer tu acceso.
      </p>
    </section>
  );
}
