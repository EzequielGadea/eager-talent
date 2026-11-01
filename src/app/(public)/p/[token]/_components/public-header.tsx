import { Lock } from "lucide-react";

type PublicHeaderProps = {
  recruiterName: string;
};

export function PublicHeader({ recruiterName }: PublicHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between border-b border-border-default pb-4">
        <div className="flex items-center gap-2.5">
          <svg
            width="32"
            height="32"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <defs>
              <linearGradient
                id="public-logo-gradient"
                x1="0"
                y1="1"
                x2="1"
                y2="0"
              >
                <stop offset="0" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#10B981" />
              </linearGradient>
            </defs>

            <path
              d="M20 2C31 2 38 9 38 20C38 31 31 38 20 38C9 38 2 31 2 20C2 9 9 2 20 2Z"
              fill="url(#public-logo-gradient)"
            />

            <g stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 22L20 15L27 22" strokeWidth="4" />
              <path
                d="M13 29.5L20 22.5L27 29.5"
                strokeWidth="4"
                opacity="0.5"
              />
            </g>
          </svg>

          <span className="font-heading text-xl font-bold tracking-tight text-text-primary">
            EagerTalent
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-border-default bg-background px-3 py-1 text-xs font-medium text-text-secondary">
          <Lock className="size-3.5 shrink-0 text-text-tertiary" />
          <span>Perfil compartido · solo lectura</span>
        </div>
      </header>

      <p className="text-xs text-text-secondary">
        Compartido por{" "}
        <span className="font-semibold text-text-primary">{recruiterName}</span>{" "}
        · Recruiter en EagerTalent
      </p>
    </div>
  );
}
