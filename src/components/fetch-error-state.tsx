"use client";

import { CircleAlert, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type FetchErrorStateProps = {
  onRetry: () => void;
  isRetrying: boolean;
  description?: string;
  // "compact" fits small cards, such as the metric cards.
  size?: "default" | "compact";
  className?: string;
};

// Shared "couldn't load" state with a retry button, used inside cards.
export function FetchErrorState({
  onRetry,
  isRetrying,
  description = "Algo salió mal, intentalo de nuevo más tarde.",
  size = "default",
  className,
}: FetchErrorStateProps) {
  const isCompact = size === "compact";

  return (
    <div
      role="alert"
      aria-busy={isRetrying}
      className={cn(
        "flex w-full max-w-md flex-col items-center text-center",
        isCompact ? "gap-2" : "gap-4",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-danger-bg",
          isCompact ? "size-9" : "size-12",
        )}
      >
        <CircleAlert
          className={cn("text-danger", isCompact ? "size-5" : "size-6")}
          aria-hidden="true"
        />
      </div>

      <div>
        <h3
          className={cn(
            "text-text-primary",
            isCompact ? "text-sm font-semibold" : "font-heading text-h3",
          )}
        >
          Error inesperado
        </h3>
        <p
          className={cn(
            "text-text-secondary",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {description}
        </p>
      </div>

      <Button
        type="button"
        size={isCompact ? "sm" : "default"}
        disabled={isRetrying}
        onClick={onRetry}
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        {isRetrying ? "Reintentando..." : "Intentar nuevamente"}
      </Button>
    </div>
  );
}
