"use client";

import { useTransition } from "react";
import { Mail } from "lucide-react";
import { toast } from "~/components/ui/toast";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { authClient } from "~/lib/auth/client";

type Props = {
  email: string;
  role: "recruiter" | "hiringManager";
};

export function ResendInviteMenuItem({ email, role }: Props) {
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
    <DropdownMenuItem
      className="text-info! hover:text-info! focus:text-info! data-highlighted:text-info! [&_svg]:text-info! hover:[&_svg]:text-info! focus:[&_svg]:text-info! data-highlighted:[&_svg]:text-info!"
      onClick={handleClick}
      disabled={isPending}
    >
      <Mail className="size-4" />
      {isPending ? "Enviando..." : "Reenviar invitación"}
    </DropdownMenuItem>
  );
}
