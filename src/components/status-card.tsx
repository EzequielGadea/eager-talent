import type { ReactNode } from "react";

type StatusCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  code?: string;
  children?: ReactNode;
};

export function StatusCard({
  icon,
  title,
  description,
  code,
  children,
}: StatusCardProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="w-full max-w-105 rounded-3xl border bg-surface-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger">
            {icon}
          </div>

          <div className="space-y-1">
            {code && (
              <p className="text-label font-bold uppercase tracking-wider text-text-tertiary">
                {code}
              </p>
            )}

            <h1 className="font-heading text-h3 text-text-primary">{title}</h1>

            <p className="text-sm text-text-secondary">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
