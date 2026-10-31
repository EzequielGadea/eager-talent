import { CircleAlert, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";

export function DashboardFetchError({
  refetch,
  isFetching,
}: {
  refetch: () => Promise<unknown>;
  isFetching: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex w-full max-w-md flex-col gap-4 text-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
          <CircleAlert className="size-6 text-danger" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Error inesperado
          </h3>
          <p className="text-sm text-text-secondary">
            Algo salió mal, intentalo de nuevo más tarde.
          </p>
        </div>
      </div>
      <div>
        <Button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {isFetching ? "Reintentando..." : "Intentar nuevamente"}
        </Button>
      </div>
    </div>
  );
}
