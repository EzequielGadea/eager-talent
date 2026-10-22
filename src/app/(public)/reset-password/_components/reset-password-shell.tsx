import { ArrowRight } from "lucide-react";

export function ResetPasswordShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
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
