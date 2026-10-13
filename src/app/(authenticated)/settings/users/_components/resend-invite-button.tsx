"use client";

import { useTransition } from "react";
import { toast } from "~/components/ui/toast";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth/client";

type Props = {
  email: string;
  role: "recruiter" | "hiringManager";
};

export function ResendInviteButton({ email, role }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const { error } = await authClient.organization.inviteMember({
        email,
        role,
        resend: true,
      });

      if (error) {
        toast.add({
          type: "error",
          title: "Error",
          description: error.message ?? "No se pudo reenviar la invitación",
        });

        return;
      }

      toast.add({
        type: "success",
        title: "Invitación reenviada",
        description: `Se envió a ${email}`,
      });
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-8 px-2 text-xs font-medium text-text-link"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Enviando..." : "Reenviar invitación"}
    </Button>
  );
}
