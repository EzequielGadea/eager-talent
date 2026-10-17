import { headers } from "next/headers";

import { auth } from "~/lib/auth";

export async function ProfileDetails() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return <p className="text-sm text-foreground/60">No iniciaste sesión.</p>;
  }

  const { user } = session;

  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-foreground/60">Nombre</dt>
        <dd>{user.name}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-foreground/60">Correo</dt>
        <dd>{user.email}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-foreground/60">Fecha de creación del usuario</dt>
        <dd>{new Date(user.createdAt).toLocaleString()}</dd>
      </div>
    </dl>
  );
}
