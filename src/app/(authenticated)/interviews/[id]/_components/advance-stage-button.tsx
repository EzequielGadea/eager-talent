"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";

type AdvanceStageButtonProps = {
  applicantId: string;
  jobOpeningId: string;
  currentStageId: string;
};

export function AdvanceStageButton({
  applicantId,
  jobOpeningId,
  currentStageId,
}: AdvanceStageButtonProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const advanceStage = api.application.advanceApplicationStage.useMutation({
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
    onSuccess: () => {
      toast.add({ title: "Postulación avanzada de etapa", type: "success" });
      startTransition(() => router.refresh());
    },
  });

  const isPending = advanceStage.isPending || isRefreshing;

  return (
    <Button
      size="sm"
      className="h-8 shrink-0 gap-2 self-start rounded-full bg-dashboard-dark px-4 text-xs font-semibold text-text-on-dark hover:bg-dashboard-dark-hover sm:self-auto"
      style={{ touchAction: "manipulation" }}
      disabled={isPending}
      onClick={() =>
        advanceStage.mutate({ applicantId, jobOpeningId, currentStageId })
      }
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <ArrowRight className="size-3.5" aria-hidden="true" />
      )}
      Avanzar de etapa
    </Button>
  );
}
