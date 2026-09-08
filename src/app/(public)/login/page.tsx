import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { LoginForm } from "./_components/login-form";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-login-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-login-heading",
});

export const metadata: Metadata = {
  title: "Iniciar sesión | EagerTalent",
};

export default function LoginPage() {
  return (
    <main
      className={`${inter.variable} ${poppins.variable} relative isolate flex min-h-full flex-1 items-center justify-center overflow-hidden bg-slate-50 font-(family-name:--font-login-sans) text-slate-900`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-28 size-105 rounded-full bg-emerald-100/60 blur-md"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 right-[18%] size-55 rounded-full bg-blue-50/80 blur-md"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-28 size-95 rounded-full bg-violet-100/60 blur-md"
      />

      <LoginForm />
    </main>
  );
}
