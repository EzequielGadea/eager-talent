"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Mail, Pencil } from "lucide-react";
import { useState } from "react";
import getAvatar from "~/lib/avatar";
import { ProfileEdit } from "./profile-edit";
import { ChangePasswordDialog } from "./change-password-dialog";
import { LogoutButton } from "./logout-button";

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

type ProfileUser = {
  name: string;
  lastName: string;
  email: string;
  image: string | null;
  createdAt: Date;
  role: string | null;
};

type ProfileCardProps = {
  user: ProfileUser;
};

export function ProfileCard({ user }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const fullName = `${user.name} ${user.lastName}`.trim();
  const avatar = getAvatar(user.name, user.lastName);

  const role = user.role
    ? (ROLES[user.role] ?? {
        label: user.role,
        className: "bg-tag-gray-bg text-tag-gray-fg",
      })
    : null;

  if (isEditing) {
    return (
      <ProfileEdit
        user={{
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
        }}
        onDone={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card shadow-sm">
        <div className="flex items-center gap-5 p-6">
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
              aria-hidden="true"
              className={`flex size-18 shrink-0 items-center justify-center rounded-xl font-heading text-2xl font-semibold ${avatar.colorClass}`}
            >
              {avatar.initials}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="truncate font-heading text-[21px] font-bold leading-tight text-text-primary">
              {fullName}
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {role && (
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${role.className}`}
                >
                  {role.label}
                </span>
              )}

              <p className="m-0 flex min-w-0 items-center gap-1.5 text-sm text-text-secondary">
                <Mail
                  size={14}
                  className="shrink-0 text-text-tertiary"
                  aria-hidden="true"
                />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Editar perfil"
            title="Editar perfil"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-default text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <Pencil size={16} />
          </button>
        </div>

        <dl className="grid gap-x-8 gap-y-4 border-t border-border-default px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProfileField label="Nombre" value={user.name} />
          <ProfileField label="Apellido" value={user.lastName} />
          <ProfileField label="Rol" value={role?.label ?? "Sin rol asignado"} />
          <ProfileField
            label="Creación"
            value={format(user.createdAt, "d/M/yyyy")}
          />
        </dl>
      </div>

      <section className="space-y-4 rounded-xl border border-border-default bg-surface-card p-6 shadow-sm">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
          Cuenta
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <ChangePasswordDialog />
          <LogoutButton />
        </div>
      </section>
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
