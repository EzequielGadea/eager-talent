"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Mail } from "lucide-react";
import { toast } from "~/components/ui/toast";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { api } from "~/lib/trpc/react";

type Props = {
  email: string;
  role: "recruiter" | "hiringManager";
};

export function ResendInviteMenuItem({ email, role }: Props) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const inviteMutation = api.user.invite.useMutation({
    onError: (error) => {
      toast.add({
        type: "error",
        title: "No se pudo reenviar la invitación",
        description: error.message,
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      toast.add({
        type: "success",
        title: "Invitación reenviada",
        description: `Se envió a ${email}`,
      });
    },
  });

  const isPending = inviteMutation.isPending || isRefreshing;

  return (
    <DropdownMenuItem
      className="text-info! hover:text-info! focus:text-info! data-highlighted:text-info! [&_svg]:text-info! hover:[&_svg]:text-info! focus:[&_svg]:text-info! data-highlighted:[&_svg]:text-info!"
      onClick={() => inviteMutation.mutate({ email, role, resend: true })}
      disabled={isPending}
    >
      <Mail className="size-4" />
      {isPending ? "Enviando..." : "Reenviar invitación"}
    </DropdownMenuItem>
  );
}
