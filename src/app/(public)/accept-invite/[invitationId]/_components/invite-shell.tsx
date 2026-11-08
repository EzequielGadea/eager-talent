import { ArrowRight } from "lucide-react";

export function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-subtle px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 size-88 rounded-full bg-success-bg/70" />
      <div className="pointer-events-none absolute right-[18%] top-[16%] size-52 rounded-full bg-info-bg/50" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-104 rounded-full bg-tag-purple-bg/60" />

      <div className="relative w-full max-w-105 rounded-3xl border bg-surface-card p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-info to-accent-purple text-text-on-dark">
            <ArrowRight className="size-4 -rotate-90" />
          </div>
          <span className="font-heading text-h2 tracking-[-0.03em] text-text-primary">
            EagerTalent
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}
