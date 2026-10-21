"use client";

import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth/client";

export function LogoutButton() {
  async function handleLogout() {
    await authClient.signOut();
    window.location.replace("/login");
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      className="w-full"
    >
      Log out
    </Button>
  );
}
