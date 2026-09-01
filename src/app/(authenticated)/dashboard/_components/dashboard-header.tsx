import { headers } from "next/headers";
import { auth } from "~/lib/auth";

export default async function Header() {
  const user = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex justify-between">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Hello {user?.user.name},</h1>
        <p className="text-sm text-foreground/60">Welcome to your dashboard.</p>
      </div>
    </div>
  );
}

