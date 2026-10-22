import Image from "next/image";
import { format } from "date-fns";
import { Mail } from "lucide-react";

const ROLES: Record<string, { label: string; className: string }> = {
  owner: {
    label: "Recruiter",
    className: "bg-tag-green-bg text-tag-green-fg",
  },
  recruiter: {
    label: "Recruiter",
    className: "bg-tag-green-bg text-tag-green-fg",
  },
  hiringManager: {
    label: "Hiring Manager",
    className: "bg-tag-purple-bg text-tag-purple-fg",
  },
  admin: {
    label: "Administrador",
    className: "bg-tag-gray-bg text-tag-gray-fg",
  },
};

type ProfileCardProps = {
  user: {
    name: string;
    lastName: string;
    email: string;
    image: string | null;
    createdAt: Date;
    role: string | null;
  };
};

export function ProfileCard({ user }: ProfileCardProps) {
  const fullName = `${user.name} ${user.lastName}`;
  const initials =
    `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const role = user.role
    ? (ROLES[user.role] ?? {
        label: user.role,
        className: "bg-tag-gray-bg text-tag-gray-fg",
      })
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card shadow-sm">
      {/* Header: avatar + name + role + email */}
      <div className="flex items-start gap-5 p-6">
        {user.image ? (
          <Image
            src={user.image}
            alt={`Foto de ${fullName}`}
            width={72}
            height={72}
            className="size-18 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-18 shrink-0 items-center justify-center rounded-xl bg-tag-green-bg font-heading text-2xl font-semibold text-tag-green-fg"
          >
            {initials}
          </div>
        )}

        <div className="min-w-0 space-y-2">
          <h2 className="truncate font-heading text-[21px] font-bold leading-tight text-text-primary">
            {fullName}
          </h2>

          {role && (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${role.className}`}
            >
              {role.label}
            </span>
          )}

          <p className="flex items-center gap-1.5 text-sm text-text-secondary">
            <Mail size={14} className="shrink-0 text-text-tertiary" />
            <span className="truncate">{user.email}</span>
          </p>
        </div>
      </div>

      {/* Footer: profile fields */}
      <dl className="grid gap-x-8 gap-y-4 border-t border-border-default px-6 py-4 sm:grid-cols-4">
        <ProfileField label="Nombre" value={user.name} />
        <ProfileField label="Apellido" value={user.lastName} />
        <ProfileField label="Rol" value={role?.label ?? "Sin rol asignado"} />
        <ProfileField
          label="Creación"
          value={format(user.createdAt, "d/M/yyyy")}
        />
      </dl>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
        {label}
      </dt>
      <dd className="truncate text-sm font-semibold text-text-primary">
        {value}
      </dd>
    </div>
  );
}
